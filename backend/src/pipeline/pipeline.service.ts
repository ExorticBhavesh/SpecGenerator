import { Injectable, NotFoundException } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PipelineInspectorDto,
  StageInspectorDto,
  ValidationPanelDto,
} from './dto/pipeline-inspector.dto';

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getPipelineInspector(id: string): Promise<PipelineInspectorDto> {
    const pipelineRun = await this.prisma.pipelineRun.findUnique({
      where: { id },
      include: {
        stageResults: { orderBy: { createdAt: 'asc' } },
        execution: true,
        repairLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
        consistencyLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!pipelineRun) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }

    const stages: StageInspectorDto[] = pipelineRun.stageResults.map((stage) => ({
      name: stage.stage,
      status: stage.status,
      durationMs: stage.durationMs,
      output: stage.outputJson as Record<string, unknown> | null,
      error: stage.error,
    }));

    const consistencyStage = pipelineRun.stageResults.find(
      (s) => s.stage === StageName.CONSISTENCY,
    );
    const repairStage = pipelineRun.stageResults.find(
      (s) => s.stage === StageName.REPAIR,
    );
    const simulationStage = pipelineRun.stageResults.find(
      (s) => s.stage === StageName.SIMULATION,
    );

    const consistencyOutput = consistencyStage?.outputJson as
      | Record<string, unknown>
      | null
      | undefined;
    const repairOutput = repairStage?.outputJson as
      | Record<string, unknown>
      | null
      | undefined;

    const validation: ValidationPanelDto = {
      errors: (consistencyOutput?.errors as unknown[]) ?? [],
      warnings: (consistencyOutput?.warnings as unknown[]) ?? [],
      repairs: (repairOutput?.repairs as unknown[]) ?? [],
    };

    return {
      id: pipelineRun.id,
      requirements: pipelineRun.requirements,
      status: pipelineRun.status,
      totalDurationMs: pipelineRun.execution?.totalDurationMs ?? null,
      stages,
      consistency: consistencyStage?.outputJson as Record<string, unknown> | null,
      repair: repairStage?.outputJson as Record<string, unknown> | null,
      simulation: simulationStage?.outputJson as Record<string, unknown> | null,
      validation,
      createdAt: pipelineRun.createdAt,
      updatedAt: pipelineRun.updatedAt,
    };
  }
}
