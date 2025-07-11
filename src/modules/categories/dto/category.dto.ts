import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  parentId?: number;

  @ApiProperty()
  subCategories?: CategoryDto[];

  @ApiProperty()
  slug: string;

  @ApiProperty()
  imageUrl: string;
}
