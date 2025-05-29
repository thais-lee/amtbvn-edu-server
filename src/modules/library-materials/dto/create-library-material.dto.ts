import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

import { FileDto } from '@modules/files/dto/file.dto';

export class CreateLibraryMaterialDto {
  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  tags?: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  categoryId: number;
}
