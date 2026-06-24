import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiPipelineService } from './ai-pipeline.service';
import { StartPipelineDto } from './dto/start-pipeline.dto';
import { PipelineRunResponseDto } from './dto/pipeline-run-response.dto';

@Controller('ai-pipeline')
export class AiPipelineController {
  constructor(private readonly aiPipelineService: AiPipelineService) {}

  @Post()
  startPipeline(
    @Body() dto: StartPipelineDto,
  ): Promise<PipelineRunResponseDto> {
    return this.aiPipelineService.startPipeline(dto);
  }

  @Get()
  listPipelineRuns(): Promise<PipelineRunResponseDto[]> {
    return this.aiPipelineService.listPipelineRuns();
  }

  @Get(':id')
  getPipelineRun(@Param('id') id: string): Promise<PipelineRunResponseDto> {
    return this.aiPipelineService.getPipelineRun(id);
  }
}
