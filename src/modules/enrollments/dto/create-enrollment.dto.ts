import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty()
  courseId: number;

  @ApiPropertyOptional()
  userId?: number;
}
