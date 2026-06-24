import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ZodIssue, ZodType, ZodArray, ZodObject, ZodDefault } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import {
  intentSchema,
  designSchema,
  databaseSchema,
  apiSchema,
  uiSchema,
} from '../ai-pipeline/schemas';
import { authConfigSchema, businessRulesSchema } from './repair.schemas';
import {
  PipelineContext,
  RepairAction,
  RepairResult,
} from './repair.types';

const STAGE_SCHEMA_MAP: Record<string, ZodType> = {
  intent: intentSchema,
  design: designSchema,
  database: databaseSchema,
  api: apiSchema,
  ui: uiSchema,
  auth: authConfigSchema,
  businessRules: businessRulesSchema,
};

@Injectable()
export class RepairService {
  constructor(private readonly prisma: PrismaService) {}

  repairJson(input: string | unknown): RepairResult {
    const repairs: RepairAction[] = [];
    let parsed: unknown = input;

    if (typeof input === 'string') {
      try {
        parsed = JSON.parse(input);
      } catch {
        const sanitized = this.sanitizeJsonString(input);
        try {
          parsed = JSON.parse(sanitized);
          repairs.push({
            type: 'invalid_json',
            path: '$',
            description: 'Sanitized and parsed invalid JSON string',
            before: input,
            after: parsed,
          });
        } catch {
          return {
            repaired: false,
            repairs: [
              {
                type: 'invalid_json',
                path: '$',
                description: 'Unable to parse JSON input',
                before: input,
              },
            ],
            finalSchema: {},
          };
        }
      }
    }

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        repaired: repairs.length > 0,
        repairs,
        finalSchema: parsed as Record<string, unknown>,
      };
    }

    return {
      repaired: repairs.length > 0,
      repairs,
      finalSchema:
        parsed && typeof parsed === 'object'
          ? (parsed as Record<string, unknown>)
          : {},
    };
  }

  repairSchema(
    data: unknown,
    schema: ZodType,
    path = '$',
  ): { data: unknown; repairs: RepairAction[] } {
    const repairs: RepairAction[] = [];
    let current = data;

    const result = schema.safeParse(current);
    if (result.success) {
      return { data: result.data, repairs };
    }

    current = this.applyZodRepairs(current, schema, result.error.issues, repairs, path);

    const retry = schema.safeParse(current);
    if (retry.success) {
      return { data: retry.data, repairs };
    }

    current = this.deepRepairFromIssues(current, retry.error.issues, repairs);
    const final = schema.safeParse(current);
    return {
      data: final.success ? final.data : current,
      repairs,
    };
  }

  repairReferences(
    context: PipelineContext,
    data: Record<string, unknown>,
  ): RepairResult {
    const repairs: RepairAction[] = [];
    const entityNames = this.collectEntityNames(context);
    const endpointPaths = this.collectEndpointPaths(context);

    if (data.relationships && Array.isArray(data.relationships)) {
      for (let i = 0; i < data.relationships.length; i++) {
        const rel = data.relationships[i] as Record<string, unknown>;
        if (rel.from && !entityNames.has(String(rel.from))) {
          const closest = this.findClosest(String(rel.from), entityNames);
          if (closest) {
            repairs.push({
              type: 'broken_reference',
              path: `relationships[${i}].from`,
              description: `Fixed broken entity reference '${rel.from}' → '${closest}'`,
              before: rel.from,
              after: closest,
            });
            rel.from = closest;
          }
        }
        if (rel.to && !entityNames.has(String(rel.to))) {
          const closest = this.findClosest(String(rel.to), entityNames);
          if (closest) {
            repairs.push({
              type: 'broken_reference',
              path: `relationships[${i}].to`,
              description: `Fixed broken entity reference '${rel.to}' → '${closest}'`,
              before: rel.to,
              after: closest,
            });
            rel.to = closest;
          }
        }
      }
    }

    if (data.pages && Array.isArray(data.pages)) {
      for (let i = 0; i < data.pages.length; i++) {
        const page = data.pages[i] as Record<string, unknown>;
        if (page.actions && Array.isArray(page.actions)) {
          for (let j = 0; j < page.actions.length; j++) {
            const action = page.actions[j] as Record<string, unknown>;
            if (action.endpoint && !this.endpointExists(String(action.endpoint), endpointPaths)) {
              const closest = this.findClosestEndpoint(
                String(action.endpoint),
                endpointPaths,
              );
              if (closest) {
                repairs.push({
                  type: 'broken_reference',
                  path: `pages[${i}].actions[${j}].endpoint`,
                  description: `Fixed broken endpoint reference`,
                  before: action.endpoint,
                  after: closest,
                });
                action.endpoint = closest;
              }
            }
          }
        }
      }
    }

    return {
      repaired: repairs.length > 0,
      repairs,
      finalSchema: data,
    };
  }

  repairTypes(data: Record<string, unknown>): RepairResult {
    const repairs: RepairAction[] = [];
    this.walkAndCoerceTypes(data, '$', repairs);
    return {
      repaired: repairs.length > 0,
      repairs,
      finalSchema: data,
    };
  }

  repairRelations(
    context: PipelineContext,
    data: Record<string, unknown>,
  ): RepairResult {
    const repairs: RepairAction[] = [];
    const db = context.database;
    if (!db) {
      return { repaired: false, repairs, finalSchema: data };
    }

    const entities = (db.entities as Array<Record<string, unknown>>) ?? [];
    const entityMap = new Map(
      entities.map((e) => [String(e.name), e]),
    );
    const existingRels = new Set(
      ((db.relationships as Array<Record<string, unknown>>) ?? []).map(
        (r) => `${r.from}:${r.to}:${r.type}`,
      ),
    );

    const relationships = [...((db.relationships as unknown[]) ?? [])];

    for (const entity of entities) {
      const fields = (entity.fields as Array<Record<string, unknown>>) ?? [];
      for (const field of fields) {
        if (field.relation && typeof field.relation === 'string') {
          const targetEntity = field.relation.split('.')[0];
          if (entityMap.has(targetEntity)) {
            const key = `${entity.name}:${targetEntity}:one-to-many`;
            if (!existingRels.has(key)) {
              const newRel = {
                from: entity.name,
                to: targetEntity,
                type: 'one-to-many',
                description: `Auto-added relation for field ${field.name}`,
              };
              relationships.push(newRel);
              existingRels.add(key);
              repairs.push({
                type: 'missing_relation',
                path: `relationships`,
                description: `Added missing relation ${entity.name} → ${targetEntity}`,
                after: newRel,
              });
            }
          }
        }
      }
    }

    if (repairs.length > 0) {
      data.relationships = relationships;
    }

    return {
      repaired: repairs.length > 0,
      repairs,
      finalSchema: data,
    };
  }

  async repairPipelineContext(
    context: PipelineContext,
    pipelineRunId?: string,
  ): Promise<RepairResult> {
    const allRepairs: RepairAction[] = [];
    const repairedContext: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(context)) {
      if (!value) continue;

      const schema = STAGE_SCHEMA_MAP[key];
      let current = { ...value };

      if (schema) {
        const { data, repairs } = this.repairSchema(current, schema, key);
        current = data as Record<string, unknown>;
        allRepairs.push(...repairs);
      }

      const typeResult = this.repairTypes(current);
      if (typeResult.repaired) {
        current = typeResult.finalSchema;
        allRepairs.push(...typeResult.repairs);
      }

      const refResult = this.repairReferences(context, current);
      if (refResult.repaired) {
        current = refResult.finalSchema;
        allRepairs.push(...refResult.repairs);
      }

      if (key === 'database') {
        const relResult = this.repairRelations(context, current);
        if (relResult.repaired) {
          current = relResult.finalSchema;
          allRepairs.push(...relResult.repairs);
        }
      }

      repairedContext[key] = current;
    }

    const auth = (repairedContext.auth as Record<string, unknown>) ?? {
      roles: [],
      permissions: [],
    };
    const authRepair = this.repairSchema(auth, authConfigSchema, 'auth');
    if (authRepair.repairs.length > 0) {
      allRepairs.push(...authRepair.repairs);
    }
    repairedContext.auth = authRepair.data;

    const result: RepairResult = {
      repaired: allRepairs.length > 0,
      repairs: allRepairs,
      finalSchema: repairedContext,
    };

    if (pipelineRunId) {
      await this.prisma.repairLog.create({
        data: {
          pipelineRunId,
          repaired: result.repaired,
          repairs: result.repairs as unknown as Prisma.InputJsonValue,
          finalSchema: result.finalSchema as Prisma.InputJsonValue,
        },
      });
    }

    return result;
  }

  async repairAndPersist(
    schema: Record<string, unknown>,
    stage?: string,
    pipelineRunId?: string,
  ): Promise<RepairResult> {
    const jsonResult = this.repairJson(schema);
    let data = jsonResult.finalSchema;
    const repairs = [...jsonResult.repairs];

    if (stage && STAGE_SCHEMA_MAP[stage]) {
      const schemaResult = this.repairSchema(data, STAGE_SCHEMA_MAP[stage], stage);
      data = schemaResult.data as Record<string, unknown>;
      repairs.push(...schemaResult.repairs);
    }

    const typeResult = this.repairTypes(data);
    if (typeResult.repaired) {
      data = typeResult.finalSchema;
      repairs.push(...typeResult.repairs);
    }

    const result: RepairResult = {
      repaired: repairs.length > 0,
      repairs,
      finalSchema: data,
    };

    if (pipelineRunId) {
      await this.prisma.repairLog.create({
        data: {
          pipelineRunId,
          repaired: result.repaired,
          repairs: result.repairs as unknown as Prisma.InputJsonValue,
          finalSchema: result.finalSchema as Prisma.InputJsonValue,
        },
      });
    }

    return result;
  }

  private sanitizeJsonString(input: string): string {
    let s = input.trim();
    if (s.startsWith('```')) {
      s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    s = s.replace(/,\s*([}\]])/g, '$1');
    return s;
  }

  private applyZodRepairs(
    data: unknown,
    schema: ZodType,
    issues: ZodIssue[],
    repairs: RepairAction[],
    path: string,
  ): unknown {
    let current = data;

    for (const issue of issues) {
      const issuePath = issue.path.length > 0 ? `${path}.${issue.path.join('.')}` : path;

      if (issue.code === 'invalid_type' && issue.received === 'undefined') {
        const defaultValue = this.getDefaultForSchema(schema, issue.path);
        current = this.setAtPath(current, issue.path, defaultValue);
        repairs.push({
          type: 'missing_key',
          path: issuePath,
          description: `Added missing key with default value`,
          after: defaultValue,
        });
      }
    }

    return current;
  }

  private deepRepairFromIssues(
    data: unknown,
    issues: ZodIssue[],
    repairs: RepairAction[],
  ): unknown {
    let current = data;

    for (const issue of issues) {
      const issuePath = issue.path.join('.') || '$';

      if (issue.code === 'invalid_type') {
        const expected = issue.expected;
        const received = issue.received;
        const defaultValue = this.defaultForType(expected);

        if (received === 'undefined' || received === 'null') {
          current = this.setAtPath(current, issue.path, defaultValue);
          repairs.push({
            type: 'missing_key',
            path: issuePath,
            description: `Added missing property (expected ${expected})`,
            after: defaultValue,
          });
        } else if (expected === 'boolean' && received === 'string') {
          const val = this.getAtPath(current, issue.path);
          const coerced = val === 'true' || val === '1';
          current = this.setAtPath(current, issue.path, coerced);
          repairs.push({
            type: 'type_mismatch',
            path: issuePath,
            description: 'Coerced string to boolean',
            before: val,
            after: coerced,
          });
        } else if (expected === 'number' && received === 'string') {
          const val = this.getAtPath(current, issue.path);
          const coerced = Number(val);
          if (!Number.isNaN(coerced)) {
            current = this.setAtPath(current, issue.path, coerced);
            repairs.push({
              type: 'type_mismatch',
              path: issuePath,
              description: 'Coerced string to number',
              before: val,
              after: coerced,
            });
          }
        } else if (expected === 'array' && received !== 'array') {
          current = this.setAtPath(current, issue.path, []);
          repairs.push({
            type: 'type_mismatch',
            path: issuePath,
            description: 'Set missing or invalid array',
            after: [],
          });
        } else if (expected === 'object' && received !== 'object') {
          current = this.setAtPath(current, issue.path, {});
          repairs.push({
            type: 'type_mismatch',
            path: issuePath,
            description: 'Set missing or invalid object',
            after: {},
          });
        } else if (expected === 'string') {
          const val = this.getAtPath(current, issue.path);
          current = this.setAtPath(current, issue.path, String(val ?? ''));
          repairs.push({
            type: 'type_mismatch',
            path: issuePath,
            description: 'Coerced value to string',
            after: String(val ?? ''),
          });
        }
      }

      if (issue.code === 'invalid_enum_value') {
        const options = (issue as { options?: string[] }).options ?? [];
        if (options.length > 0) {
          current = this.setAtPath(current, issue.path, options[0]);
          repairs.push({
            type: 'type_mismatch',
            path: issuePath,
            description: `Set invalid enum to '${options[0]}'`,
            after: options[0],
          });
        }
      }
    }

    return current;
  }

  private getDefaultForSchema(schema: ZodType, path: (string | number)[]): unknown {
    if (path.length === 0) {
      return this.defaultForSchema(schema);
    }

    const key = path[0];
    if (schema instanceof ZodObject) {
      const shape = schema.shape;
      const fieldSchema = shape[key as string];
      if (fieldSchema) {
        return this.getDefaultForSchema(fieldSchema as ZodType, path.slice(1));
      }
    }

    return this.defaultForType('unknown');
  }

  private defaultForSchema(schema: ZodType): unknown {
    if (schema instanceof ZodDefault) {
      return schema._def.defaultValue();
    }
    if (schema instanceof ZodArray) {
      return [];
    }
    if (schema instanceof ZodObject) {
      const result: Record<string, unknown> = {};
      const shape = schema.shape;
      for (const [key, fieldSchema] of Object.entries(shape)) {
        result[key] = this.defaultForSchema(fieldSchema as ZodType);
      }
      return result;
    }
    return this.defaultForType('unknown');
  }

  private defaultForType(expected: string): unknown {
    switch (expected) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  private walkAndCoerceTypes(
    obj: unknown,
    path: string,
    repairs: RepairAction[],
  ): void {
    if (obj === null || obj === undefined) return;

    if (Array.isArray(obj)) {
      obj.forEach((item, i) => this.walkAndCoerceTypes(item, `${path}[${i}]`, repairs));
      return;
    }

    if (typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = `${path}.${key}`;

      if (value === null || value === undefined) {
        (obj as Record<string, unknown>)[key] = '';
        repairs.push({
          type: 'type_mismatch',
          path: currentPath,
          description: 'Replaced null/undefined with empty string',
          before: value,
          after: '',
        });
      } else if (typeof value === 'object') {
        this.walkAndCoerceTypes(value, currentPath, repairs);
      }
    }
  }

  private setAtPath(data: unknown, path: (string | number)[], value: unknown): unknown {
    if (path.length === 0) return value;

    const clone =
      data !== null && typeof data === 'object'
        ? Array.isArray(data)
          ? [...data]
          : { ...(data as Record<string, unknown>) }
        : {};

    let current: Record<string | number, unknown> = clone as Record<string | number, unknown>;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (current[key] === undefined || current[key] === null) {
        current[key] = typeof path[i + 1] === 'number' ? [] : {};
      }
      current = current[key] as Record<string | number, unknown>;
    }
    current[path[path.length - 1]] = value;
    return clone;
  }

  private getAtPath(data: unknown, path: (string | number)[]): unknown {
    let current: unknown = data;
    for (const key of path) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string | number, unknown>)[key];
    }
    return current;
  }

  private collectEntityNames(context: PipelineContext): Set<string> {
    const names = new Set<string>();
    const entities = (context.database?.entities as Array<Record<string, unknown>>) ?? [];
    for (const e of entities) {
      if (e.name) names.add(String(e.name));
      if (e.tableName) names.add(String(e.tableName));
    }
    return names;
  }

  private collectEndpointPaths(context: PipelineContext): Set<string> {
    const paths = new Set<string>();
    const endpoints = (context.api?.endpoints as Array<Record<string, unknown>>) ?? [];
    for (const ep of endpoints) {
      if (ep.path) paths.add(String(ep.path));
      if (ep.method && ep.path) {
        paths.add(`${ep.method} ${ep.path}`);
      }
    }
    return paths;
  }

  private endpointExists(endpoint: string, paths: Set<string>): boolean {
    if (paths.has(endpoint)) return true;
    for (const p of paths) {
      if (endpoint.includes(p) || p.includes(endpoint)) return true;
    }
    return false;
  }

  private findClosest(value: string, candidates: Set<string>): string | null {
    const lower = value.toLowerCase();
    for (const c of candidates) {
      if (c.toLowerCase() === lower) return c;
      if (c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())) return c;
    }
    return candidates.size > 0 ? [...candidates][0] : null;
  }

  private findClosestEndpoint(endpoint: string, paths: Set<string>): string | null {
    const lower = endpoint.toLowerCase();
    for (const p of paths) {
      if (p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase())) return p;
    }
    return paths.size > 0 ? [...paths][0] : null;
  }
}
