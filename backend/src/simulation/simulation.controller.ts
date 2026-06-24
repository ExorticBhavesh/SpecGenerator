import { Controller, Post, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationRunDto } from './dto/simulation-run.dto';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('run')
  run(@Body() dto: SimulationRunDto) {
    return this.simulationService.run(dto.context);
  }
}
