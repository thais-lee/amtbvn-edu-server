import { IsInt, IsOptional } from 'class-validator';

import { PaginatedSearchSortInput } from '@shared/base-get-input';
import { Transform } from 'class-transformer';

export class GetCategoryDto extends PaginatedSearchSortInput {
  @IsOptional()
  @IsInt()
  @Transform((param) => Number(param.value))
  parentId?: number;
}
