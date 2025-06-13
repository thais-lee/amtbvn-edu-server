import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PaginatedInput } from '@shared/base-get-input';

export class AnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  questionId: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => JSON.stringify(value))
  answer?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  selectedOptionId?: number;
}

export class StartActivityAttemptDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  activityId: number;
}

export class SubmitActivityAttemptDto {
  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  answers: AnswerDto[];
}

export class GetActivityAttemptsDto extends PaginatedInput {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  activityId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  studentId?: number;
}
