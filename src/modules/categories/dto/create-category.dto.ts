import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}
