import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EnrollmentStatus } from '@prisma/client';

export class CreateEnrollmentDto {
  @ApiProperty()
  courseId: number;

  @ApiPropertyOptional()
  userId?: number;

  @ApiPropertyOptional()
  status?: EnrollmentStatus;
}
