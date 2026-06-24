import { Controller, Post, Body } from '@nestjs/common';
import { ConsistencyService } from './consistency.service';
import { ConsistencyCheckDto } from './dto/consistency-check.dto';

@Controller('consistency')
export class ConsistencyController {
  constructor(private readonly consistencyService: ConsistencyService) {}

  @Post('check')
  check(@Body() dto: ConsistencyCheckDto) {
    return this.consistencyService.check(dto.context, dto.pipelineRunId);
  }
}
