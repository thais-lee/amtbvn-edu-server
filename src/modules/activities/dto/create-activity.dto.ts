import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ActivityStatus, ActivityType } from '@prisma/client';
import { Transform, plainToClass } from 'class-transformer';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CreateActivityQuestionDto } from './create-activity-question.dto';

export class CreateActivityDto {
  @ApiProperty({
    description: 'Title of the activity',
    example: 'Math Quiz - Chapter 1',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'Basic arithmetic operations quiz',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type of the activity',
    enum: ActivityType,
    example: ActivityType.QUIZ,
  })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({
    description: 'Status of the activity',
    enum: ActivityStatus,
    example: ActivityStatus.PUBLISHED,
  })
  @IsEnum(ActivityStatus)
  status: ActivityStatus;

  @ApiProperty({
    description: 'Time limit in minutes',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({
    description: 'Due date for the activity',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Maximum number of attempts allowed',
    example: 3,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  maxAttempts?: number;

  @ApiPropertyOptional({
    description: 'Passing score percentage',
    example: 70,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  passScore?: number;

  @ApiPropertyOptional({
    description: 'Whether to shuffle questions',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @Type(() => Boolean)
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({
    description: 'Course ID (required if lessonId is not provided)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ValidateIf((o) => !o.lessonId)
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Lesson ID (required if courseId is not provided)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ValidateIf((o) => !o.courseId)
  lessonId?: number;

  @ApiProperty({
    description: 'List of questions for the activity',
    type: [CreateActivityQuestionDto],
    example: [
      {
        question: 'What is 2 + 2?',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityQuestionDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item) =>
            plainToClass(CreateActivityQuestionDto, item),
          );
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse "questions" JSON string:', e);
        return value;
      }
    }
    return value;
  })
  @IsOptional()
  questions?: CreateActivityQuestionDto[];
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
