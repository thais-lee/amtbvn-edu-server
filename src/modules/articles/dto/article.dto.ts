import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ArticleStatus, ArticlesType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PaginatedSearchSortInput } from '@shared/base-get-input';

export class ArticleImageDto {
  @ApiProperty()
  @IsInt()
  fileId: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  order?: number;
}

export class ArticleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty({ enum: ArticlesType })
  type: ArticlesType;

  @ApiProperty({ enum: ArticleStatus })
  status: ArticleStatus;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ArticleImageDto] })
  images?: ArticleImageDto[];
}

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ enum: ArticlesType })
  @IsEnum(ArticlesType)
  type: ArticlesType;

  @ApiProperty({ enum: ArticleStatus, required: false })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @ApiPropertyOptional({
    type: [ArticleImageDto],
    description: 'Array of image file IDs and their order',
  })
  @IsOptional() // Cho phép không gửi ảnh nào
  @IsArray() // Phải là một mảng
  @ValidateNested({ each: true }) // Validate từng object trong mảng
  @Type(() => ArticleImageDto) // Chỉ định class để transform và validate
  images?: ArticleImageDto[];
}

export class UpdateArticleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ enum: ArticlesType, required: false })
  @IsEnum(ArticlesType)
  @IsOptional()
  type?: ArticlesType;

  @ApiProperty({ enum: ArticleStatus, required: false })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @ApiProperty({ type: [ArticleImageDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => ArticleImageDto)
  @IsOptional()
  images?: ArticleImageDto[];
}

export class GetArticlesDto extends PaginatedSearchSortInput {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ enum: ArticlesType, required: false })
  @IsEnum(ArticlesType)
  @IsOptional()
  type?: ArticlesType;

  @ApiProperty({ enum: ArticleStatus, required: false })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
