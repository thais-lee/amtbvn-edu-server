import { CourseStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  categoryId?: number;

  status?: CourseStatus;
}
