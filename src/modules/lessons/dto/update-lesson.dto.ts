import { ApiPropertyOptional } from '@nestjs/swagger';

import { LessonStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsArray, ArrayUnique } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  previousId?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Status of the lesson',
    enum: LessonStatus,
  })
  @IsEnum(LessonStatus)
  @Transform((param) => param.value as LessonStatus)
  status: LessonStatus;

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
