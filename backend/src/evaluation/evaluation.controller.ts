import { Controller, Get, Post } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get()
  getEvaluation() {
    return this.evaluationService.getLatestEvaluation();
  }

  @Get('history')
  getHistory() {
    return this.evaluationService.getAllEvaluations();
  }

  @Post('run')
  runEvaluation() {
    return this.evaluationService.runEvaluation();
  }
}
