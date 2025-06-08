import { ApiPropertyOptional } from '@nestjs/swagger';

import { ERole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { PaginatedSearchSortInput } from '@shared/base-get-input';

export class AdminGetUsersDto extends PaginatedSearchSortInput {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'List of role',
    isArray: true,
    enum: ERole,
  })
  @Transform(({ value }) => (value ? Array.prototype.concat(value) : []))
  roles?: ERole[];
}

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
