import { ApiPropertyOptional } from '@nestjs/swagger';

import { ExerciseType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

import { SearchInput } from '@shared/base-get-input';

export class GetLessonExerciseDto extends SearchInput {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  lessonId?: number;

  @ApiPropertyOptional({ enum: ExerciseType })
  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  courseId?: number;
}
