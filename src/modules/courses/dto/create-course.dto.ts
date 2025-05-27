import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';
import { IsString, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  categoryId: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  status?: CourseStatus;
}
