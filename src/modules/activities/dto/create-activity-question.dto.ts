import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class QuestionOptionDto {
  @ApiProperty({
    description: 'Text of the option',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'Whether this option is correct',
  })
  @IsBoolean()
  @Type(() => Boolean)
  isCorrect: boolean;
}

export class CreateActivityQuestionDto {
  @ApiProperty({
    description: 'The question text',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({
    description: 'List of options for multiple choice questions',
    type: [QuestionOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @ApiProperty({})
  @IsNumber()
  @Type(() => Number)
  points: number;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  correctAnswer?: string;
}
