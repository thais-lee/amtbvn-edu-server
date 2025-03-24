import { ApiPropertyOptional } from '@nestjs/swagger';

import { CourseStatus } from '@prisma/client';

import { SearchSortInput } from '@shared/base-get-input';

export class GetCoursesDto extends SearchSortInput {
  @ApiPropertyOptional()
  categoryId?: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  status?: CourseStatus;
}
