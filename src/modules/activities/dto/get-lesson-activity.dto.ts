import { ApiPropertyOptional } from '@nestjs/swagger';

import { ActivityType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

import { SearchInput } from '@shared/base-get-input';

export class GetLessonExerciseDto extends SearchInput {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  lessonId?: number;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  courseId?: number;
}
