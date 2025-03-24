import { ApiPropertyOptional } from '@nestjs/swagger';

import { EnrollmentStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}
