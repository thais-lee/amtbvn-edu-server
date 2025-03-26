import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ExerciseType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lessonId: number;

  @ApiProperty({ enum: ExerciseType })
  @IsEnum(ExerciseType)
  type: ExerciseType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;
}
