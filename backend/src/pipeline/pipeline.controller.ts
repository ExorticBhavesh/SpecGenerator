import { Controller, Get, Param } from '@nestjs/common';
import { PipelineService } from './pipeline.service';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get(':id')
  getPipeline(@Param('id') id: string) {
    return this.pipelineService.getPipelineInspector(id);
  }
}
