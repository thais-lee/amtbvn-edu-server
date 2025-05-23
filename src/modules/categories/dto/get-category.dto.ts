import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { PaginatedSearchSortInput } from '@shared/base-get-input';

export class GetCategoryDto extends PaginatedSearchSortInput {
  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  parentId?: number;

  @IsOptional()
  @IsString()
  slug?: string;
}
