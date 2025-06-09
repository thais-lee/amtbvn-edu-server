import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, ArrayNotEmpty, ArrayUnique } from 'class-validator';

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

  @ApiPropertyOptional({ type: [Number], description: 'IDs of media files (video/audio)' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  mediaFileIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'IDs of document files (pdf, doc, etc.)' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  documentFileIds?: number[];
}
