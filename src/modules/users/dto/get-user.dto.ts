import { ApiPropertyOptional } from '@nestjs/swagger';

import { ERole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

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
