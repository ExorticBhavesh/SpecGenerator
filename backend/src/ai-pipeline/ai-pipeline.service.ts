import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StartPipelineDto } from './dto/start-pipeline.dto';
import { PipelineRunResponseDto } from './dto/pipeline-run-response.dto';
import { PipelineRunnerService } from './pipeline-runner.service';

@Injectable()
export class AiPipelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelineRunner: PipelineRunnerService,
  ) {}

  async startPipeline(dto: StartPipelineDto): Promise<PipelineRunResponseDto> {
    const pipelineRun = await this.prisma.pipelineRun.create({
      data: {
        requirements: dto.requirements,
        userId: dto.userId,
      },
    });

    await this.pipelineRunner.run(pipelineRun.id, dto.requirements);

    return this.getPipelineRun(pipelineRun.id);
  }

  async getPipelineRun(id: string): Promise<PipelineRunResponseDto> {
    const pipelineRun = await this.prisma.pipelineRun.findUnique({
      where: { id },
      include: {
        stageResults: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!pipelineRun) {
      throw new NotFoundException(`Pipeline run ${id} not found`);
    }

    return this.toResponseDto(pipelineRun);
  }

  async listPipelineRuns(): Promise<PipelineRunResponseDto[]> {
    const runs = await this.prisma.pipelineRun.findMany({
      include: {
        stageResults: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return runs.map((run) => this.toResponseDto(run));
  }

  private toResponseDto(
    pipelineRun: Prisma.PipelineRunGetPayload<{
      include: { stageResults: true };
    }>,
  ): PipelineRunResponseDto {
    return {
      id: pipelineRun.id,
      requirements: pipelineRun.requirements,
      status: pipelineRun.status,
      userId: pipelineRun.userId,
      createdAt: pipelineRun.createdAt,
      updatedAt: pipelineRun.updatedAt,
      stageResults: pipelineRun.stageResults.map((stage) => ({
        id: stage.id,
        stage: stage.stage,
        inputJson: stage.inputJson as Record<string, unknown>,
        outputJson: stage.outputJson as Record<string, unknown> | null,
        status: stage.status,
        error: stage.error,
        durationMs: stage.durationMs,
        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt,
      })),
    };
  }
}
