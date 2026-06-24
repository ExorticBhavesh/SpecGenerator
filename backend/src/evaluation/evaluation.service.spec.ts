import { Test, TestingModule } from '@nestjs/testing';
import { PipelineStatus } from '@prisma/client';
import { EvaluationService } from './evaluation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiPipelineService } from '../ai-pipeline/ai-pipeline.service';

describe('EvaluationService', () => {
  let service: EvaluationService;

  const mockPrisma = {
    evaluationRun: {
      create: jest.fn().mockResolvedValue({ id: 'eval-1' }),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockAiPipeline = {
    startPipeline: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiPipelineService, useValue: mockAiPipeline },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
    jest.clearAllMocks();
    mockPrisma.evaluationRun.create.mockResolvedValue({ id: 'eval-1' });
  });

  it('should return null when no evaluation exists', async () => {
    mockPrisma.evaluationRun.findFirst.mockResolvedValue(null);
    const result = await service.getLatestEvaluation();
    expect(result).toBeNull();
  });

  it('should compute metrics from pipeline results', async () => {
    mockAiPipeline.startPipeline.mockResolvedValue({
      id: 'run-1',
      status: PipelineStatus.COMPLETED,
      stageResults: [
        {
          stage: 'REPAIR',
          outputJson: { repairs: [{ type: 'missing_key' }] },
        },
        {
          stage: 'CONSISTENCY',
          outputJson: { errors: [] },
        },
      ],
    });

    const result = await service.runEvaluation();

    expect(result.metrics.successRate).toBeGreaterThan(0);
    expect(result.metrics.repairCount).toBeGreaterThan(0);
    expect(mockPrisma.evaluationRun.update).toHaveBeenCalled();
  });
});
