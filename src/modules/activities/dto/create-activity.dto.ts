import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, QuestionType } from '@prisma/client';

import { plainToClass, Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, ValidateNested, IsArray, IsNotEmpty, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
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
    description: 'Time limit in minutes',
    example: 30,
  })
  @IsNumber()
  @Type(() => Number)
  timeLimitMinutes: number;

  @ApiPropertyOptional({
    description: 'Due date for the activity',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Maximum number of attempts allowed',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAttempts?: number;

  @ApiPropertyOptional({
    description: 'Passing score percentage',
    example: 70,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  passScore?: number;

  @ApiPropertyOptional({
    description: 'Whether to shuffle questions',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  shuffleQuestions?: boolean;

  @ApiProperty({
    description: 'ID of the creator',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  creatorId: number;

  @ApiPropertyOptional({
    description: 'Course ID (required if lessonId is not provided)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ValidateIf((o) => !o.lessonId)
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Lesson ID (required if courseId is not provided)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ValidateIf((o) => !o.courseId)
  lessonId?: number;

  @ApiProperty({
    description: 'List of questions for the activity',
    type: [CreateActivityQuestionDto],
    example: [{
      question: 'What is 2 + 2?',
      type: 'MULTIPLE_CHOICE',
      points: 1,
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false }
      ]
    }]
  })
    @Transform(({ value }) => {
    // This transform runs BEFORE validation decorators below (@IsArray, @ValidateNested)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Important: Convert plain objects to class instances for nested validation
          return parsed.map(item => plainToClass(CreateActivityQuestionDto, item));
        }
        // If parsing works but it's not an array, let IsArray handle it
        return parsed;
      } catch (e) {
        // Failed to parse JSON, return the original string to deliberately fail validation
        console.error('Failed to parse "questions" JSON string:', e);
        return value;
      }
    }
    // If it's already an object/array (e.g., from application/json request), pass it through
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityQuestionDto)
  questions: CreateActivityQuestionDto[];

  @ApiPropertyOptional({
    description: 'Activity files',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  @IsArray()
  @Type(() => Array)
  files?: Express.Multer.File[];
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
