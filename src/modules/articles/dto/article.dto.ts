import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus, ArticlesType } from '@prisma/client';

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
}

export class CreateArticleDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty({ enum: ArticlesType })
  type: ArticlesType;

  @ApiPropertyOptional({ enum: ArticleStatus })
  status?: ArticleStatus;
}

export class UpdateArticleDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiPropertyOptional()
  categoryId?: number;

  @ApiPropertyOptional({ enum: ArticlesType })
  type?: ArticlesType;

  @ApiPropertyOptional({ enum: ArticleStatus })
  status?: ArticleStatus;
}

export class GetArticlesDto {
  @ApiPropertyOptional()
  categoryId?: number;

  @ApiPropertyOptional({ enum: ArticlesType })
  type?: ArticlesType;

  @ApiPropertyOptional({ enum: ArticleStatus })
  status?: ArticleStatus;

  @ApiPropertyOptional()
  search?: string;
} 