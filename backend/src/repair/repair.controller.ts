import { Controller, Post, Body } from '@nestjs/common';
import { RepairService } from './repair.service';
import { RepairRequestDto } from './dto/repair.dto';

@Controller('repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  repair(@Body() dto: RepairRequestDto) {
    return this.repairService.repairAndPersist(
      dto.schema,
      dto.stage,
      dto.pipelineRunId,
    );
  }
}
