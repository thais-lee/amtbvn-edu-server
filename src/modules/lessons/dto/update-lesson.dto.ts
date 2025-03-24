import { ApiPropertyOptional } from '@nestjs/swagger';

import { LessonStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

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
}
