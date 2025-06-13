import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AnswerGradeDto {
  @ApiProperty({ description: 'Answer ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Score for this answer' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  score: number;

  @ApiProperty({ description: 'Feedback for this answer' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class GradeAttemptDto {
  @ApiProperty({ description: 'Overall feedback for the attempt' })
  @IsString()
  @IsOptional()
  overallFeedback?: string;

  @ApiProperty({
    description: 'Array of answer grades',
    type: [AnswerGradeDto],
  })
  answers: AnswerGradeDto[];
}
