import { Injectable, Logger } from '@nestjs/common';
import {
  PipelineStatus,
  Prisma,
  StageName,
  StageStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PIPELINE_STAGE_ORDER, POST_GENERATION_STAGES } from './constants/stage-order';
import { ApiStage } from './stages/api.stage';
import { ConsistencyStage } from './stages/consistency.stage';
import { DatabaseStage } from './stages/database.stage';
import { DesignStage } from './stages/design.stage';
import { IntentStage } from './stages/intent.stage';
import { PipelineStage } from './stages/pipeline-stage.interface';
import { RepairStage } from './stages/repair.stage';
import { SimulationStage } from './stages/simulation.stage';
import { UiStage } from './stages/ui.stage';

@Injectable()
export class PipelineRunnerService {
  private readonly logger = new Logger(PipelineRunnerService.name);
  private readonly stageMap: Map<StageName, PipelineStage>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly intentStage: IntentStage,
    private readonly designStage: DesignStage,
    private readonly databaseStage: DatabaseStage,
    private readonly apiStage: ApiStage,
    private readonly uiStage: UiStage,
    private readonly consistencyStage: ConsistencyStage,
    private readonly repairStage: RepairStage,
    private readonly simulationStage: SimulationStage,
  ) {
    this.stageMap = new Map<StageName, PipelineStage>([
      [StageName.INTENT, this.intentStage],
      [StageName.DESIGN, this.designStage],
      [StageName.DATABASE, this.databaseStage],
      [StageName.API, this.apiStage],
      [StageName.UI, this.uiStage],
      [StageName.CONSISTENCY, this.consistencyStage],
      [StageName.REPAIR, this.repairStage],
      [StageName.SIMULATION, this.simulationStage],
    ]);
  }

  async run(pipelineRunId: string, requirements: string): Promise<void> {
    const pipelineStart = Date.now();

    await this.prisma.pipelineExecution.upsert({
      where: { pipelineRunId },
      create: {
        pipelineRunId,
        status: PipelineStatus.RUNNING,
      },
      update: {
        status: PipelineStatus.RUNNING,
      },
    });

    await this.prisma.pipelineRun.update({
      where: { id: pipelineRunId },
      data: { status: PipelineStatus.RUNNING },
    });

    const stageOutputs = new Map<StageName, Record<string, unknown>>();
    let previousOutput: Record<string, unknown> = { requirements };

    for (const stageName of PIPELINE_STAGE_ORDER) {
      const stage = this.stageMap.get(stageName);
      if (!stage) {
        throw new Error(`Stage handler not found: ${stageName}`);
      }

      const isPostGeneration = POST_GENERATION_STAGES.includes(stageName);
      const stageInput = isPostGeneration
        ? {
            pipelineRunId,
            stageOutputs: Object.fromEntries(stageOutputs),
          }
        : previousOutput;

      const stageResult = await this.prisma.pipelineStageResult.upsert({
        where: {
          pipelineRunId_stage: { pipelineRunId, stage: stageName },
        },
        create: {
          pipelineRunId,
          stage: stageName,
          inputJson: stageInput as Prisma.InputJsonValue,
          status: StageStatus.RUNNING,
        },
        update: {
          inputJson: stageInput as Prisma.InputJsonValue,
          status: StageStatus.RUNNING,
          error: null,
        },
      });

      const stageStart = Date.now();

      try {
        this.logger.log(
          `Running stage ${stageName} for pipeline ${pipelineRunId}`,
        );
        const output = await stage.execute(stageInput);
        const durationMs = Date.now() - stageStart;

        if (!isPostGeneration) {
          stageOutputs.set(stageName, output);
          previousOutput = output;
        }

        await this.prisma.pipelineStageResult.update({
          where: { id: stageResult.id },
          data: {
            outputJson: output as Prisma.InputJsonValue,
            status: StageStatus.COMPLETED,
            durationMs,
          },
        });
      } catch (error) {
        const durationMs = Date.now() - stageStart;
        const message =
          error instanceof Error ? error.message : 'Unknown stage error';

        await this.prisma.pipelineStageResult.update({
          where: { id: stageResult.id },
          data: {
            status: StageStatus.FAILED,
            error: message,
            durationMs,
          },
        });

        await this.prisma.pipelineRun.update({
          where: { id: pipelineRunId },
          data: { status: PipelineStatus.FAILED },
        });

        await this.prisma.pipelineExecution.update({
          where: { pipelineRunId },
          data: {
            status: PipelineStatus.FAILED,
            totalDurationMs: Date.now() - pipelineStart,
          },
        });

        throw error;
      }
    }

    const totalDurationMs = Date.now() - pipelineStart;

    await this.prisma.pipelineRun.update({
      where: { id: pipelineRunId },
      data: { status: PipelineStatus.COMPLETED },
    });

    await this.prisma.pipelineExecution.update({
      where: { pipelineRunId },
      data: {
        status: PipelineStatus.COMPLETED,
        totalDurationMs,
      },
    });
  }
}
