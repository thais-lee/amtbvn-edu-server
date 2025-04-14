import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;
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
  answers: AnswerDto[];
}

export class GetActivityAttemptsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  activityId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  studentId?: number;
} 