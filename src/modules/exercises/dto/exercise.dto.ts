import { ApiProperty } from '@nestjs/swagger';

import { ExerciseType } from '@prisma/client';

export class LessonExerciseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ExerciseType })
  type: ExerciseType;

  @ApiProperty()
  lessonId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
