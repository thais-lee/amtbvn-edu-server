import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  categoryId: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  status?: CourseStatus;
}
