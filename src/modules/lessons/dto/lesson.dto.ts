import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LessonStatus } from '@prisma/client';

export class LessonDto {
  @ApiProperty()
  id: number;

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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LessonDetailDto extends LessonDto {
  @ApiProperty()
  previous: LessonDto;

  @ApiProperty()
  next: LessonDto;
}
