import { ApiProperty } from '@nestjs/swagger';

import { CategoryDto } from '@modules/categories/dto/category.dto';
import { FileDto } from '@modules/files/dto/file.dto';

export class LibraryMaterialDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  category: CategoryDto;

  @ApiProperty()
  files: FileDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
