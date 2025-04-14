import { ApiPropertyOptional } from '@nestjs/swagger';

import { ActivityType, ActivityStatus } from '@prisma/client';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateActivityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  timeLimitMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dueDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  maxAttempts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  passScore?: number;

  @ApiPropertyOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  courseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  lessonId?: number;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsInt({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  fileIdsToRemove?: number[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsInt({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  fileIdsToKeep?: number[];
}
