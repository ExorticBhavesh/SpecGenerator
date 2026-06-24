import { Injectable, Logger } from '@nestjs/common';
import { PipelineStatus, Prisma, StageName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiPipelineService } from '../ai-pipeline/ai-pipeline.service';
import { EVALUATION_DATASET } from './evaluation.dataset';
import {
  EvaluationHistoryDto,
  EvaluationResponseDto,
  EvaluationRunItemDto,
} from './dto/evaluation-response.dto';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiPipelineService: AiPipelineService,
  ) {}

  async getLatestEvaluation(): Promise<EvaluationHistoryDto | null> {
    const run = await this.prisma.evaluationRun.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!run) return null;

    return this.toHistoryDto(run);
  }

  async getAllEvaluations(): Promise<EvaluationHistoryDto[]> {
    const runs = await this.prisma.evaluationRun.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return runs.map((r) => this.toHistoryDto(r));
  }

  async runEvaluation(): Promise<EvaluationResponseDto> {
    const evaluationRun = await this.prisma.evaluationRun.create({
      data: { status: PipelineStatus.RUNNING },
    });

    const runItems: EvaluationRunItemDto[] = [];
    const failureTypes: string[] = [];
    let totalLatency = 0;
    let successCount = 0;
    let totalRepairs = 0;
    let totalConsistencyErrors = 0;
    let repairRunCount = 0;

    for (const prompt of EVALUATION_DATASET) {
      const start = Date.now();
      let success = false;
      let repairCount = 0;
      let consistencyErrors = 0;
      let failureType: string | undefined;
      let pipelineRunId: string | undefined;

      try {
        this.logger.log(`Evaluating prompt: ${prompt.id}`);
        const result = await this.aiPipelineService.startPipeline({
          requirements: prompt.prompt,
        });

        pipelineRunId = result.id;
        const latencyMs = Date.now() - start;
        totalLatency += latencyMs;

        success = result.status === PipelineStatus.COMPLETED;

        const repairStage = result.stageResults.find(
          (s) => s.stage === StageName.REPAIR,
        );
        if (repairStage?.outputJson) {
          const repairs = (repairStage.outputJson.repairs as unknown[]) ?? [];
          repairCount = repairs.length;
          if (repairCount > 0) repairRunCount++;
          totalRepairs += repairCount;
        }

        const consistencyStage = result.stageResults.find(
          (s) => s.stage === StageName.CONSISTENCY,
        );
        if (consistencyStage?.outputJson) {
          const errors = (consistencyStage.outputJson.errors as unknown[]) ?? [];
          consistencyErrors = errors.length;
          totalConsistencyErrors += consistencyErrors;
        }

        if (success) {
          successCount++;
        } else {
          failureType = 'pipeline_failed';
          failureTypes.push(failureType);
        }

        runItems.push({
          promptId: prompt.id,
          subcategory: prompt.subcategory,
          category: prompt.category,
          success,
          latencyMs,
          repairCount,
          consistencyErrors,
          failureType,
          pipelineRunId,
        });
      } catch (error) {
        const latencyMs = Date.now() - start;
        totalLatency += latencyMs;
        failureType =
          error instanceof Error ? error.message : 'unknown_error';
        failureTypes.push(failureType);

        runItems.push({
          promptId: prompt.id,
          subcategory: prompt.subcategory,
          category: prompt.category,
          success: false,
          latencyMs,
          repairCount: 0,
          consistencyErrors: 0,
          failureType,
          pipelineRunId,
        });
      }
    }

    const totalRuns = EVALUATION_DATASET.length;
    const metrics = {
      successRate: totalRuns > 0 ? successCount / totalRuns : 0,
      averageLatency: totalRuns > 0 ? totalLatency / totalRuns : 0,
      repairRate: totalRuns > 0 ? repairRunCount / totalRuns : 0,
      repairCount: totalRepairs,
      failureTypes: [...new Set(failureTypes)],
      consistencyErrors: totalConsistencyErrors,
    };

    await this.prisma.evaluationRun.update({
      where: { id: evaluationRun.id },
      data: {
        status: PipelineStatus.COMPLETED,
        runs: runItems as unknown as Prisma.InputJsonValue,
        metrics: metrics as Prisma.InputJsonValue,
        successRate: metrics.successRate,
        averageLatency: metrics.averageLatency,
        repairRate: metrics.repairRate,
        repairCount: metrics.repairCount,
        failureTypes: metrics.failureTypes as Prisma.InputJsonValue,
        consistencyErrors: metrics.consistencyErrors,
      },
    });

    return { runs: runItems, metrics };
  }

  private toHistoryDto(
    run: Prisma.EvaluationRunGetPayload<object>,
  ): EvaluationHistoryDto {
    const runs = (run.runs as unknown as EvaluationRunItemDto[]) ?? [];
    const storedMetrics = run.metrics as Record<string, unknown> | null;

    const metrics = {
      successRate: run.successRate,
      averageLatency: run.averageLatency,
      repairRate: run.repairRate,
      repairCount: run.repairCount,
      failureTypes: (run.failureTypes as string[]) ?? [],
      consistencyErrors: run.consistencyErrors,
    };

    if (storedMetrics) {
      Object.assign(metrics, storedMetrics);
    }

    return {
      id: run.id,
      status: run.status,
      runs,
      metrics,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
    };
  }
}
