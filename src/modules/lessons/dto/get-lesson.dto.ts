import { ApiPropertyOptional } from '@nestjs/swagger';

import { LessonStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

import { SearchSortInput } from '@shared/base-get-input';

export class GetLessonDto extends SearchSortInput {
  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  courseId?: number;

  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  previousId?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Status of the lesson',
    enum: LessonStatus,
  })
  @Transform(({ value }) => value as LessonStatus)
  status?: LessonStatus;
}
