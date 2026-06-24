import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Compiler Pipeline (e2e)', () => {
  let app: INestApplication;

  const mockPrisma = {
    pipelineRun: {
      create: jest.fn().mockResolvedValue({ id: 'test-run', requirements: 'test' }),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    pipelineStageResult: {
      upsert: jest.fn().mockResolvedValue({ id: 'stage-1' }),
      update: jest.fn(),
    },
    pipelineExecution: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    repairLog: { create: jest.fn() },
    consistencyLog: { create: jest.fn() },
    evaluationRun: {
      create: jest.fn().mockResolvedValue({ id: 'eval-1' }),
      update: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/consistency/check', () => {
    return request(app.getHttpServer())
      .post('/api/consistency/check')
      .send({
        context: {
          database: { entities: [{ name: 'User', fields: [{ name: 'email' }] }] },
          api: {
            endpoints: [
              {
                method: 'POST',
                path: '/users',
                requestBody: {
                  contentType: 'json',
                  schema: { properties: { email: {} } },
                },
              },
            ],
          },
          ui: { forms: [{ name: 'f', fields: [{ name: 'email' }] }] },
        },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('passed');
        expect(res.body).toHaveProperty('errors');
      });
  });

  it('POST /api/repair', () => {
    return request(app.getHttpServer())
      .post('/api/repair')
      .send({ schema: { roles: [] }, stage: 'auth' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('repaired');
        expect(res.body.finalSchema).toHaveProperty('permissions');
      });
  });

  it('POST /api/simulation/run', () => {
    return request(app.getHttpServer())
      .post('/api/simulation/run')
      .send({
        context: {
          database: {
            entities: [
              { name: 'User', tableName: 'users', fields: [{ name: 'id' }] },
            ],
            relationships: [],
          },
          api: {
            basePath: '/api',
            endpoints: [{ method: 'GET', path: '/users' }],
          },
          ui: {
            pages: [{ name: 'Users', route: '/users' }],
            navigation: [],
          },
        },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('pass');
        expect(res.body).toHaveProperty('checks');
      });
  });

  it('GET /api/evaluation', () => {
    return request(app.getHttpServer())
      .get('/api/evaluation')
      .expect(200);
  });
});
