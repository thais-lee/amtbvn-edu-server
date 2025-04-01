import { ApiProperty } from '@nestjs/swagger';

import { ActivityType } from '@prisma/client';

export class LessonActivityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ActivityType })
  type: ActivityType;

  @ApiProperty()
  lessonId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
