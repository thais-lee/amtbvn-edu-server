import { CourseStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';

import { SearchSortInput } from '@shared/base-get-input';

export class GetCoursesDto extends SearchSortInput {
  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  categoryId?: number;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}
