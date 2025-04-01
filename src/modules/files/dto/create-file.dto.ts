import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  storagePath: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  uploadedBy: number;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsNumber()
  size: number;
}
