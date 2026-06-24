import { Injectable } from '@nestjs/common';
import {
  PipelineContext,
  SimulationCheck,
  SimulationResult,
} from './simulation.types';

const VALID_HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class SimulationService {
  run(context: PipelineContext): SimulationResult {
    const checks: SimulationCheck[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.simulateDatabase(context, checks, warnings, errors);
    this.simulateApi(context, checks, warnings, errors);
    this.simulateUi(context, checks, warnings, errors);
    this.simulateAuth(context, checks, warnings, errors);

    const pass = errors.length === 0 && checks.every((c) => c.passed);

    return { pass, checks, warnings, errors };
  }

  private simulateDatabase(
    context: PipelineContext,
    checks: SimulationCheck[],
    warnings: string[],
    errors: string[],
  ): void {
    const database = context.database;
    if (!database) {
      errors.push('Database schema missing — cannot simulate DB creation');
      return;
    }

    const entities = (database.entities as Array<Record<string, unknown>>) ?? [];
    if (entities.length === 0) {
      errors.push('No database entities defined');
      return;
    }

    checks.push({
      category: 'database',
      name: 'tables_exist',
      passed: entities.length > 0,
      message: `Found ${entities.length} table(s)`,
    });

    const entityNames = new Set<string>();
    for (const entity of entities) {
      const name = String(entity.name ?? '');
      const tableName = String(entity.tableName ?? '');
      entityNames.add(name);

      const fields = (entity.fields as Array<Record<string, unknown>>) ?? [];
      const hasPk = fields.some(
        (f) =>
          f.name === 'id' ||
          (f.unique === true && f.required === true) ||
          String(f.name).endsWith('Id'),
      );

      checks.push({
        category: 'database',
        name: `primary_key_${name}`,
        passed: hasPk || fields.length > 0,
        message: hasPk
          ? `Entity '${name}' has primary key`
          : `Entity '${name}' missing explicit primary key`,
      });

      if (!hasPk) {
        warnings.push(`Entity '${name}' has no explicit primary key field`);
      }

      if (!tableName) {
        errors.push(`Entity '${name}' missing tableName`);
      }
    }

    const relationships = (database.relationships as Array<Record<string, unknown>>) ?? [];
    for (const rel of relationships) {
      const from = String(rel.from ?? '');
      const to = String(rel.to ?? '');
      const valid = entityNames.has(from) && entityNames.has(to);

      checks.push({
        category: 'database',
        name: `relation_${from}_${to}`,
        passed: valid,
        message: valid
          ? `Relation ${from} → ${to} (${rel.type}) is valid`
          : `Relation ${from} → ${to} references unknown entities`,
      });

      if (!valid) {
        errors.push(`Invalid relation: ${from} → ${to}`);
      }
    }

    checks.push({
      category: 'database',
      name: 'relations_exist',
      passed: relationships.length > 0 || entities.length <= 1,
      message: `${relationships.length} relation(s) defined`,
    });
  }

  private simulateApi(
    context: PipelineContext,
    checks: SimulationCheck[],
    warnings: string[],
    errors: string[],
  ): void {
    const api = context.api;
    if (!api) {
      errors.push('API schema missing — cannot simulate API generation');
      return;
    }

    const endpoints = (api.endpoints as Array<Record<string, unknown>>) ?? [];
    if (endpoints.length === 0) {
      errors.push('No API endpoints defined');
      return;
    }

    checks.push({
      category: 'api',
      name: 'routes_exist',
      passed: endpoints.length > 0,
      message: `Found ${endpoints.length} endpoint(s)`,
    });

    for (const endpoint of endpoints) {
      const method = String(endpoint.method ?? '');
      const path = String(endpoint.path ?? '');
      const methodValid = VALID_HTTP_METHODS.has(method);

      checks.push({
        category: 'api',
        name: `method_${method}_${path}`,
        passed: methodValid && path.length > 0,
        message: methodValid
          ? `${method} ${path} is valid`
          : `Invalid method '${method}' for ${path}`,
      });

      if (!methodValid) {
        errors.push(`Invalid HTTP method '${method}' on ${path}`);
      }
      if (!path.startsWith('/')) {
        warnings.push(`Endpoint path '${path}' should start with '/'`);
      }
    }

    const basePath = String(api.basePath ?? '');
    checks.push({
      category: 'api',
      name: 'base_path',
      passed: basePath.length > 0,
      message: basePath ? `Base path: ${basePath}` : 'Missing base path',
    });
  }

  private simulateUi(
    context: PipelineContext,
    checks: SimulationCheck[],
    warnings: string[],
    errors: string[],
  ): void {
    const ui = context.ui;
    if (!ui) {
      errors.push('UI schema missing — cannot simulate UI generation');
      return;
    }

    const pages = (ui.pages as Array<Record<string, unknown>>) ?? [];
    const navigation = (ui.navigation as Array<Record<string, unknown>>) ?? [];

    if (pages.length === 0) {
      errors.push('No UI pages defined');
      return;
    }

    checks.push({
      category: 'ui',
      name: 'pages_exist',
      passed: pages.length > 0,
      message: `Found ${pages.length} page(s)`,
    });

    const pageRoutes = new Set<string>();
    for (const page of pages) {
      const route = String(page.route ?? '');
      pageRoutes.add(route);

      checks.push({
        category: 'ui',
        name: `page_route_${page.name}`,
        passed: route.length > 0 && route.startsWith('/'),
        message: route
          ? `Page '${page.name}' route: ${route}`
          : `Page '${page.name}' missing route`,
      });

      if (!route) {
        errors.push(`Page '${page.name}' has no route`);
      }
    }

    for (const nav of navigation) {
      const route = String(nav.route ?? '');
      const inPages = pageRoutes.has(route);

      checks.push({
        category: 'ui',
        name: `nav_route_${nav.label}`,
        passed: inPages,
        message: inPages
          ? `Navigation '${nav.label}' → ${route} exists`
          : `Navigation '${nav.label}' → ${route} not found in pages`,
      });

      if (!inPages) {
        warnings.push(`Navigation item '${nav.label}' route '${route}' not in pages`);
      }
    }

    checks.push({
      category: 'ui',
      name: 'routes_exist',
      passed: pageRoutes.size > 0,
      message: `${pageRoutes.size} unique route(s)`,
    });
  }

  private simulateAuth(
    context: PipelineContext,
    checks: SimulationCheck[],
    warnings: string[],
    errors: string[],
  ): void {
    const auth = context.auth;
    const api = context.api;

    const roles = (auth?.roles as Array<Record<string, unknown>>) ?? [];
    const permissions = (auth?.permissions as Array<Record<string, unknown>>) ?? [];

    const apiRequiresAuth =
      api?.endpoints &&
      ((api.endpoints as Array<Record<string, unknown>>).some((e) => e.authRequired) ||
        (api.authentication as Record<string, unknown>)?.type !== 'none');

    if (!apiRequiresAuth) {
      checks.push({
        category: 'auth',
        name: 'auth_optional',
        passed: true,
        message: 'API does not require authentication',
      });
      return;
    }

    checks.push({
      category: 'auth',
      name: 'roles_exist',
      passed: roles.length > 0,
      message: roles.length > 0 ? `${roles.length} role(s) defined` : 'No roles defined',
    });

    if (roles.length === 0) {
      errors.push('Auth required but no roles defined');
    }

    const roleNames = new Set(roles.map((r) => String(r.name)));
    let allMapped = true;

    for (const permission of permissions) {
      const permRoles = (permission.roles as string[]) ?? [];
      const mapped = permRoles.every((r) => roleNames.has(r));

      checks.push({
        category: 'auth',
        name: `permission_${permission.name}`,
        passed: mapped,
        message: mapped
          ? `Permission '${permission.name}' correctly mapped`
          : `Permission '${permission.name}' has unmapped roles`,
      });

      if (!mapped) {
        allMapped = false;
        errors.push(`Permission '${permission.name}' references invalid roles`);
      }
    }

    checks.push({
      category: 'auth',
      name: 'permissions_mapped',
      passed: allMapped && permissions.length > 0,
      message:
        permissions.length > 0
          ? `${permissions.length} permission(s) checked`
          : 'No permissions defined',
    });

    if (permissions.length === 0 && roles.length > 0) {
      warnings.push('Roles defined but no permissions mapped');
    }
  }
}
