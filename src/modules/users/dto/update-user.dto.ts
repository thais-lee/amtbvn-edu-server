import { ApiProperty } from '@nestjs/swagger';

import { EGender, ERole } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEnum(EGender)
  @ApiProperty({ enum: EGender })
  gender?: EGender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(ERole)
  @ApiProperty({ enum: ERole })
  role?: ERole;
}
