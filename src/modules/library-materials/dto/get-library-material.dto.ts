import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

import { PaginatedSearchSortInput } from '@shared/base-get-input';

export class GetLibraryMaterialDto extends PaginatedSearchSortInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  categoryId?: number;
} 