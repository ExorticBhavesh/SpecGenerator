import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartPipelineDto {
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
