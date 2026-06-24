import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AiPipelineModule } from './ai-pipeline/ai-pipeline.module';
import { ConsistencyModule } from './consistency/consistency.module';
import { RepairModule } from './repair/repair.module';
import { SimulationModule } from './simulation/simulation.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiPipelineModule,
    ConsistencyModule,
    RepairModule,
    SimulationModule,
    EvaluationModule,
    PipelineModule,
  ],
})
export class AppModule {}
