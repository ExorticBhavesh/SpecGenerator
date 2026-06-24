import { Test, TestingModule } from '@nestjs/testing';
import { RepairService } from './repair.service';
import { PrismaService } from '../prisma/prisma.service';
import { authConfigSchema } from './repair.schemas';

describe('RepairService', () => {
  let service: RepairService;

  const mockPrisma = {
    repairLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RepairService>(RepairService);
    jest.clearAllMocks();
  });

  describe('repairJson', () => {
    it('should parse valid JSON string', () => {
      const result = service.repairJson('{"roles": []}');
      expect(result.finalSchema).toEqual({ roles: [] });
      expect(result.repaired).toBe(false);
    });

    it('should repair JSON with trailing commas', () => {
      const result = service.repairJson('{"roles": [],}');
      expect(result.finalSchema).toEqual({ roles: [] });
      expect(result.repaired).toBe(true);
    });

    it('should return failure for completely invalid JSON', () => {
      const result = service.repairJson('not json at all {{{');
      expect(result.repaired).toBe(false);
      expect(result.repairs.length).toBeGreaterThan(0);
    });
  });

  describe('repairSchema', () => {
    it('should add missing permissions array', () => {
      const data = { roles: [] };
      const { data: repaired, repairs } = service.repairSchema(
        data,
        authConfigSchema,
      );
      expect(repaired).toHaveProperty('permissions');
      expect((repaired as { permissions: unknown[] }).permissions).toEqual([]);
      expect(repairs.length).toBeGreaterThan(0);
    });

    it('should pass through valid schema', () => {
      const data = {
        roles: [{ name: 'admin' }],
        permissions: [
          { name: 'read', roles: ['admin'], resource: 'users', action: 'read' },
        ],
      };
      const { repairs } = service.repairSchema(data, authConfigSchema);
      expect(repairs.length).toBe(0);
    });
  });

  describe('repairTypes', () => {
    it('should coerce null values to empty strings', () => {
      const data = { name: null, nested: { field: null } };
      const result = service.repairTypes(data);
      expect(result.repaired).toBe(true);
      expect(result.finalSchema.name).toBe('');
    });
  });

  describe('repairRelations', () => {
    it('should add missing relations for relation fields', () => {
      const context = {
        database: {
          entities: [
            {
              name: 'Order',
              fields: [
                { name: 'userId', relation: 'User.id' },
              ],
            },
            {
              name: 'User',
              fields: [{ name: 'id' }],
            },
          ],
          relationships: [],
        },
      };
      const data = { ...context.database } as Record<string, unknown>;
      const result = service.repairRelations(context, data);
      expect(result.repaired).toBe(true);
      expect((data.relationships as unknown[]).length).toBeGreaterThan(0);
    });
  });
});
