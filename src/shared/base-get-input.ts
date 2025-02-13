// import { ApiPropertyOptional } from '@nestjs/swagger';

// import { Prisma } from '@prisma/client';
// import { Type } from 'class-transformer';

// export class PaginatedInput {
//   @ApiPropertyOptional({ type: 'number' })
//   @Type(() => Number)
//   skip?: number;

//   @ApiPropertyOptional({ type: 'number' })
//   @Type(() => Number)
//   take?: number;
// }

// export class SearchInput {
//   @ApiPropertyOptional({ type: 'string' })
//   search?: string;
// }

// export class SortInput {
//   @ApiPropertyOptional({ type: 'string' })
//   sort?: string;

//   @ApiPropertyOptional({ type: 'string', enum: Prisma.SortOrder })
//   order?: Prisma.SortOrder;
// }

// export class PaginatedSearchInput extends PaginatedInput {
//   @ApiPropertyOptional({ type: 'string' })
//   search?: string;
// }

// export class PaginatedSortInput extends PaginatedInput {
//   @ApiPropertyOptional({ type: 'string' })
//   sort?: string;

//   @ApiPropertyOptional({ type: 'string', enum: Prisma.SortOrder })
//   order?: Prisma.SortOrder;
// }

// export class PaginatedSearchSortInput extends PaginatedInput {
//   @ApiPropertyOptional({ type: 'string' })
//   search?: string;

//   @ApiPropertyOptional({ type: 'string' })
//   sort?: string;

//   @ApiPropertyOptional({ type: 'string', enum: Prisma.SortOrder })
//   order?: Prisma.SortOrder;
// }

// export class SearchSortInput extends SearchInput {
//   @ApiPropertyOptional({ type: 'string' })
//   sort?: string;

//   @ApiPropertyOptional({ type: 'string', enum: Prisma.SortOrder })
//   order?: Prisma.SortOrder;
// }
