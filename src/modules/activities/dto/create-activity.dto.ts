import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType;

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
  @IsNumber()
  @Transform(({ value }) => Number(value))
  passScore?: number;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  shuffleQuestions: boolean;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  creatorId: number;

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
}

export class ActivityMaterialDto {
  @ApiProperty()
  @IsInt()
  @Transform(({ value }) => Number(value))
  activityId: number;

  @ApiProperty()
  @IsInt()
  @Transform(({ value }) => Number(value))
  fileId: number;
}
