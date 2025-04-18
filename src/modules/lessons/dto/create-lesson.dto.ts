import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LessonStatus } from '@prisma/client';

export class CreateLessonDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  isImportant: boolean;

  @ApiProperty({ enum: LessonStatus })
  status: LessonStatus;

  @ApiProperty()
  courseId: number;

  @ApiPropertyOptional()
  previousId: number;
}
