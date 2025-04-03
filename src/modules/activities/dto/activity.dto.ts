import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ActivityType } from '@prisma/client';

import { ActivityMaterialDto } from '@modules/activities/dto/create-activity.dto';

export class LessonActivityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: ActivityType })
  type: ActivityType;

  @ApiPropertyOptional()
  lessonId?: number;

  @ApiPropertyOptional()
  courseId?: number;

  @ApiPropertyOptional()
  timeLimitMinutes?: number;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  maxAttempts?: number;

  @ApiPropertyOptional()
  passScore?: number;

  @ApiPropertyOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional()
  materials?: ActivityMaterialDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
