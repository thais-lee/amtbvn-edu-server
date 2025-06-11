import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { QuestionType } from '@prisma/client';
import { Transform, Type, plainToClass } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
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
  @Transform(({ value }) => (value === 'true' || value === true ? true : false))
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

  @ApiProperty({})
  @IsInt()
  @Transform(({ value }) => Number(value))
  points: number;

  @ApiPropertyOptional({
    description: 'List of options for multiple choice questions',
    type: [QuestionOptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) => plainToClass(QuestionOptionDto, item));
    }
    return [];
  })
  @IsOptional()
  options: QuestionOptionDto[];

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  correctAnswer?: string;
}
