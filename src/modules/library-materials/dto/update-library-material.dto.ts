import { PartialType } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional } from 'class-validator';

import { CreateLibraryMaterialDto } from './create-library-material.dto';

export class UpdateLibraryMaterialDto extends PartialType(
  CreateLibraryMaterialDto,
) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    return value.map((id: string) => Number(id));
  })
  fileIdsToRemove?: number[];

  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    return value.map((id: string) => Number(id));
  })
  fileIds: number[];
}
