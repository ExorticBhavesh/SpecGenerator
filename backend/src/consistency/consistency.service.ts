import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConsistencyIssue,
  ConsistencyResult,
  PipelineContext,
} from './consistency.types';

@Injectable()
export class ConsistencyService {
  constructor(private readonly prisma: PrismaService) {}

  async check(
    context: PipelineContext,
    pipelineRunId?: string,
  ): Promise<ConsistencyResult> {
    const errors: ConsistencyIssue[] = [];
    const warnings: ConsistencyIssue[] = [];

    this.validateUiAgainstApi(context, errors, warnings);
    this.validateApiAgainstDatabase(context, errors, warnings);
    this.validateAuthAgainstRoles(context, errors, warnings);
    this.validateBusinessRules(context, errors, warnings);

    const result: ConsistencyResult = {
      passed: errors.length === 0,
      errors,
      warnings,
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
        uiApiIssues: errors.filter((e) => e.code.startsWith('UI_API')).length,
        apiDbIssues: errors.filter((e) => e.code.startsWith('API_DB')).length,
        authIssues: errors.filter((e) => e.code.startsWith('AUTH')).length,
        ruleIssues: errors.filter((e) => e.code.startsWith('RULE')).length,
      },
    };

    if (pipelineRunId) {
      await this.prisma.consistencyLog.create({
        data: {
          pipelineRunId,
          passed: result.passed,
          errors: result.errors as unknown as Prisma.InputJsonValue,
          warnings: result.warnings as unknown as Prisma.InputJsonValue,
          summary: result.summary as Prisma.InputJsonValue,
        },
      });
    }

    return result;
  }

  private validateUiAgainstApi(
    context: PipelineContext,
    errors: ConsistencyIssue[],
    warnings: ConsistencyIssue[],
  ): void {
    const ui = context.ui;
    const api = context.api;
    if (!ui || !api) return;

    const apiFields = this.collectApiFieldNames(api);
    const apiEndpoints = this.collectApiEndpoints(api);

    const forms = (ui.forms as Array<Record<string, unknown>>) ?? [];
    for (const form of forms) {
      const fields = (form.fields as Array<Record<string, unknown>>) ?? [];
      for (const field of fields) {
        const name = String(field.name ?? '');
        if (name && !apiFields.has(name)) {
          errors.push({
            code: 'UI_API_FIELD_MISSING',
            message: `UI form field '${name}' does not exist in API schema`,
            path: `forms.${form.name}.${name}`,
            severity: 'error',
          });
        }
      }
    }

    const pages = (ui.pages as Array<Record<string, unknown>>) ?? [];
    for (const page of pages) {
      const components = (page.components as Array<Record<string, unknown>>) ?? [];
      for (const comp of components) {
        const bindings = (comp.apiBindings as string[]) ?? [];
        for (const binding of bindings) {
          if (!this.bindingExistsInApi(binding, apiEndpoints, apiFields)) {
            warnings.push({
              code: 'UI_API_BINDING',
              message: `UI component '${comp.name}' binding '${binding}' not found in API`,
              path: `pages.${page.name}.components.${comp.name}`,
              severity: 'warning',
            });
          }
        }

        const props = (comp.props as Record<string, unknown>) ?? {};
        for (const propValue of Object.values(props)) {
          if (typeof propValue === 'string' && propValue.length > 0) {
            const fieldName = propValue.replace(/[^a-zA-Z0-9_]/g, '');
            if (fieldName && !apiFields.has(fieldName) && this.looksLikeFieldName(propValue)) {
              warnings.push({
                code: 'UI_API_PROP',
                message: `UI prop '${propValue}' may not exist in API schema`,
                path: `pages.${page.name}.components.${comp.name}.props`,
                severity: 'warning',
              });
            }
          }
        }
      }

      const actions = (page.actions as Array<Record<string, unknown>>) ?? [];
      for (const action of actions) {
        const endpoint = String(action.endpoint ?? '');
        if (endpoint && !this.endpointMatchesApi(endpoint, apiEndpoints)) {
          errors.push({
            code: 'UI_API_ENDPOINT',
            message: `UI action '${action.label}' references unknown endpoint '${endpoint}'`,
            path: `pages.${page.name}.actions`,
            severity: 'error',
          });
        }
      }
    }
  }

  private validateApiAgainstDatabase(
    context: PipelineContext,
    errors: ConsistencyIssue[],
    warnings: ConsistencyIssue[],
  ): void {
    const api = context.api;
    const database = context.database;
    if (!api || !database) return;

    const dbFields = this.collectDatabaseFieldNames(database);
    const endpoints = (api.endpoints as Array<Record<string, unknown>>) ?? [];

    for (const endpoint of endpoints) {
      const method = String(endpoint.method ?? '');
      const path = String(endpoint.path ?? '');
      const requestBody = endpoint.requestBody as Record<string, unknown> | null;

      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        const schema = (requestBody.schema as Record<string, unknown>) ?? {};
        const fields = this.extractSchemaFields(schema);

        for (const field of fields) {
          if (!dbFields.has(field)) {
            errors.push({
              code: 'API_DB_FIELD_MISSING',
              message: `${method} ${path} requires field '${field}' which does not exist in DB schema`,
              path: `endpoints.${method} ${path}.requestBody.${field}`,
              severity: 'error',
            });
          }
        }
      }

      if (endpoint.authRequired && !context.auth) {
        warnings.push({
          code: 'API_DB_AUTH',
          message: `Endpoint ${method} ${path} requires auth but no auth config provided`,
          path: `endpoints.${method} ${path}`,
          severity: 'warning',
        });
      }
    }
  }

  private validateAuthAgainstRoles(
    context: PipelineContext,
    errors: ConsistencyIssue[],
    warnings: ConsistencyIssue[],
  ): void {
    const auth = context.auth;
    if (!auth) return;

    const roles = (auth.roles as Array<Record<string, unknown>>) ?? [];
    const permissions = (auth.permissions as Array<Record<string, unknown>>) ?? [];
    const roleNames = new Set(roles.map((r) => String(r.name)));

    if (roles.length === 0) {
      warnings.push({
        code: 'AUTH_NO_ROLES',
        message: 'Auth config has no roles defined',
        severity: 'warning',
      });
    }

    for (const permission of permissions) {
      const permRoles = (permission.roles as string[]) ?? [];
      for (const role of permRoles) {
        if (!roleNames.has(role)) {
          errors.push({
            code: 'AUTH_ROLE_INVALID',
            message: `Permission '${permission.name}' references invalid role '${role}'`,
            path: `permissions.${permission.name}.roles`,
            severity: 'error',
          });
        }
      }
    }

    const api = context.api;
    if (api?.authentication) {
      const authType = (api.authentication as Record<string, unknown>).type;
      if (authType !== 'none' && roles.length === 0) {
        errors.push({
          code: 'AUTH_ROLE_MISSING',
          message: `API requires ${authType} authentication but no roles are defined`,
          severity: 'error',
        });
      }
    }
  }

  private validateBusinessRules(
    context: PipelineContext,
    errors: ConsistencyIssue[],
    warnings: ConsistencyIssue[],
  ): void {
    const rules = context.businessRules;
    if (!rules) return;

    const entities = this.collectEntityNames(context);
    const ruleList = (rules.rules as Array<Record<string, unknown>>) ?? [];

    for (const rule of ruleList) {
      const entity = String(rule.entity ?? '');
      if (entity && !entities.has(entity)) {
        errors.push({
          code: 'RULE_ENTITY_INVALID',
          message: `Business rule '${rule.name}' references unknown entity '${entity}'`,
          path: `rules.${rule.name}.entity`,
          severity: 'error',
        });
      }
    }

    if (ruleList.length === 0) {
      warnings.push({
        code: 'RULE_EMPTY',
        message: 'No business rules defined',
        severity: 'warning',
      });
    }
  }

  private collectApiFieldNames(api: Record<string, unknown>): Set<string> {
    const fields = new Set<string>();
    const endpoints = (api.endpoints as Array<Record<string, unknown>>) ?? [];

    for (const endpoint of endpoints) {
      const requestBody = endpoint.requestBody as Record<string, unknown> | null;
      if (requestBody?.schema) {
        for (const f of this.extractSchemaFields(requestBody.schema as Record<string, unknown>)) {
          fields.add(f);
        }
      }
      const responseBody = endpoint.responseBody as Record<string, unknown> | null;
      if (responseBody?.schema) {
        for (const f of this.extractSchemaFields(responseBody.schema as Record<string, unknown>)) {
          fields.add(f);
        }
      }
    }

    return fields;
  }

  private collectApiEndpoints(api: Record<string, unknown>): Set<string> {
    const endpoints = new Set<string>();
    const list = (api.endpoints as Array<Record<string, unknown>>) ?? [];
    for (const ep of list) {
      endpoints.add(String(ep.path ?? ''));
      endpoints.add(`${ep.method} ${ep.path}`);
    }
    return endpoints;
  }

  private collectDatabaseFieldNames(database: Record<string, unknown>): Set<string> {
    const fields = new Set<string>();
    const entities = (database.entities as Array<Record<string, unknown>>) ?? [];
    for (const entity of entities) {
      const entityFields = (entity.fields as Array<Record<string, unknown>>) ?? [];
      for (const f of entityFields) {
        fields.add(String(f.name));
      }
    }
    return fields;
  }

  private collectEntityNames(context: PipelineContext): Set<string> {
    const names = new Set<string>();
    const entities = (context.database?.entities as Array<Record<string, unknown>>) ?? [];
    for (const e of entities) {
      if (e.name) names.add(String(e.name));
    }
    const modules = (context.design?.modules as Array<Record<string, unknown>>) ?? [];
    for (const m of modules) {
      if (m.name) names.add(String(m.name));
    }
    return names;
  }

  private extractSchemaFields(schema: Record<string, unknown>): string[] {
    const fields: string[] = [];
    if (schema.properties && typeof schema.properties === 'object') {
      for (const key of Object.keys(schema.properties as Record<string, unknown>)) {
        fields.push(key);
      }
    }
    for (const [key, value] of Object.entries(schema)) {
      if (key !== 'properties' && key !== 'type' && typeof value !== 'object') {
        fields.push(key);
      }
    }
    return fields;
  }

  private bindingExistsInApi(
    binding: string,
    endpoints: Set<string>,
    fields: Set<string>,
  ): boolean {
    if (endpoints.has(binding) || fields.has(binding)) return true;
    for (const ep of endpoints) {
      if (binding.includes(ep) || ep.includes(binding)) return true;
    }
    return false;
  }

  private endpointMatchesApi(endpoint: string, apiEndpoints: Set<string>): boolean {
    if (apiEndpoints.has(endpoint)) return true;
    for (const ep of apiEndpoints) {
      if (endpoint.includes(ep) || ep.includes(endpoint)) return true;
    }
    return false;
  }

  private looksLikeFieldName(value: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
  }
}
