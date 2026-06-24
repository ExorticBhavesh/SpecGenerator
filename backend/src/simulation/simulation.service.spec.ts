import { Test, TestingModule } from '@nestjs/testing';
import { SimulationService } from './simulation.service';

describe('SimulationService', () => {
  let service: SimulationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimulationService],
    }).compile();

    service = module.get<SimulationService>(SimulationService);
  });

  const validContext = {
    database: {
      entities: [
        {
          name: 'User',
          tableName: 'users',
          fields: [{ name: 'id', required: true, unique: true }],
        },
      ],
      relationships: [],
    },
    api: {
      basePath: '/api',
      endpoints: [
        { method: 'GET', path: '/users', authRequired: false },
      ],
    },
    ui: {
      pages: [{ name: 'Users', route: '/users' }],
      navigation: [{ label: 'Users', route: '/users' }],
    },
    auth: {
      roles: [{ name: 'admin' }],
      permissions: [
        { name: 'read', roles: ['admin'], resource: 'users', action: 'read' },
      ],
    },
  };

  it('should pass simulation for valid context', () => {
    const result = service.run(validContext);
    expect(result.pass).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.checks.length).toBeGreaterThan(0);
  });

  it('should fail when database is missing', () => {
    const result = service.run({ api: validContext.api });
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes('Database'))).toBe(true);
  });

  it('should fail for invalid HTTP method', () => {
    const context = {
      ...validContext,
      api: {
        basePath: '/api',
        endpoints: [{ method: 'INVALID', path: '/users' }],
      },
    };
    const result = service.run(context);
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid HTTP method'))).toBe(true);
  });

  it('should warn when navigation route not in pages', () => {
    const context = {
      ...validContext,
      ui: {
        pages: [{ name: 'Home', route: '/home' }],
        navigation: [{ label: 'Users', route: '/users' }],
      },
    };
    const result = service.run(context);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should check auth roles when API requires auth', () => {
    const context = {
      ...validContext,
      api: {
        basePath: '/api',
        endpoints: [{ method: 'GET', path: '/users', authRequired: true }],
        authentication: { type: 'jwt' },
      },
      auth: { roles: [], permissions: [] },
    };
    const result = service.run(context);
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes('roles'))).toBe(true);
  });
});
