import { Test, TestingModule } from '@nestjs/testing';
import { ConsistencyService } from './consistency.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConsistencyService', () => {
  let service: ConsistencyService;

  const mockPrisma = {
    consistencyLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsistencyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConsistencyService>(ConsistencyService);
    jest.clearAllMocks();
  });

  const baseContext = {
    database: {
      entities: [
        {
          name: 'User',
          fields: [
            { name: 'id' },
            { name: 'name' },
            { name: 'email' },
          ],
        },
      ],
    },
    api: {
      endpoints: [
        {
          method: 'POST',
          path: '/users',
          requestBody: {
            contentType: 'application/json',
            schema: { properties: { name: {}, email: {} } },
          },
          authRequired: true,
        },
      ],
      authentication: { type: 'jwt', description: 'JWT auth' },
    },
    ui: {
      forms: [
        {
          name: 'userForm',
          fields: [{ name: 'email' }, { name: 'name' }],
        },
      ],
      pages: [
        {
          name: 'Users',
          route: '/users',
          actions: [{ label: 'Create', endpoint: 'POST /users' }],
          components: [],
        },
      ],
    },
    auth: {
      roles: [{ name: 'admin' }],
      permissions: [
        { name: 'user_create', roles: ['admin'], resource: 'users', action: 'create' },
      ],
    },
    businessRules: {
      rules: [{ name: 'UserRule', entity: 'User', condition: 'valid', action: 'enforce' }],
    },
  };

  it('should pass when all schemas are consistent', async () => {
    const result = await service.check(baseContext);
    expect(result.passed).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should detect UI field missing in API', async () => {
    const context = {
      ...baseContext,
      ui: {
        ...baseContext.ui,
        forms: [
          {
            name: 'userForm',
            fields: [{ name: 'phone' }],
          },
        ],
      },
    };
    const result = await service.check(context);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.code === 'UI_API_FIELD_MISSING')).toBe(true);
  });

  it('should detect API field missing in DB', async () => {
    const context = {
      ...baseContext,
      api: {
        ...baseContext.api,
        endpoints: [
          {
            method: 'POST',
            path: '/users',
            requestBody: {
              contentType: 'application/json',
              schema: { properties: { phone: {} } },
            },
            authRequired: false,
          },
        ],
      },
    };
    const result = await service.check(context);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.code === 'API_DB_FIELD_MISSING')).toBe(true);
  });

  it('should detect invalid role in permissions', async () => {
    const context = {
      ...baseContext,
      auth: {
        roles: [{ name: 'admin' }],
        permissions: [
          { name: 'test', roles: ['superadmin'], resource: '*', action: 'read' },
        ],
      },
    };
    const result = await service.check(context);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.code === 'AUTH_ROLE_INVALID')).toBe(true);
  });

  it('should persist log when pipelineRunId provided', async () => {
    await service.check(baseContext, 'run-123');
    expect(mockPrisma.consistencyLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ pipelineRunId: 'run-123' }),
      }),
    );
  });
});
