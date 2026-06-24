import { Module } from '@nestjs/common';
import { AiPipelineController } from './ai-pipeline.controller';
import { AiPipelineService } from './ai-pipeline.service';
import { PipelineRunnerService } from './pipeline-runner.service';
import { GeminiService } from './gemini/gemini.service';
import { IntentStage } from './stages/intent.stage';
import { DesignStage } from './stages/design.stage';
import { DatabaseStage } from './stages/database.stage';
import { ApiStage } from './stages/api.stage';
import { UiStage } from './stages/ui.stage';
import { ConsistencyStage } from './stages/consistency.stage';
import { RepairStage } from './stages/repair.stage';
import { SimulationStage } from './stages/simulation.stage';
import { RepairModule } from '../repair/repair.module';
import { ConsistencyModule } from '../consistency/consistency.module';
import { SimulationModule } from '../simulation/simulation.module';

@Module({
  imports: [RepairModule, ConsistencyModule, SimulationModule],
  controllers: [AiPipelineController],
  providers: [
    AiPipelineService,
    PipelineRunnerService,
    GeminiService,
    IntentStage,
    DesignStage,
    DatabaseStage,
    ApiStage,
    UiStage,
    ConsistencyStage,
    RepairStage,
    SimulationStage,
  ],
  exports: [AiPipelineService],
})
export class AiPipelineModule {}
