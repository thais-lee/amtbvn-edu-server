import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LessonStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

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
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @ApiPropertyOptional()
  previousId: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs of media files (video/audio)',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  mediaFileIds?: number[];

  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs of document files (pdf, doc, etc.)',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  documentFileIds?: number[];
}
