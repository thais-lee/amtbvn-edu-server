import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { ArticleStatus, ArticlesType } from '@prisma/client';

import { CreateArticleDto } from './dto/article.dto';
import { GetArticlesDto } from './dto/article.dto';
import { UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, userId: number) {
    // Check if category exists
    const category = await this.prisma.categories.findUnique({
      where: {
        id: createArticleDto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.articles.create({
      data: {
        ...createArticleDto,
        userId,
        status: createArticleDto.status || ArticleStatus.DRAFT,
      },
    });
  }

  async findAll(input: GetArticlesDto) {
    return this.prisma.articles.findMany({
      where: {
        categoryId: input.categoryId,
        type: input.type,
        status: input.status,
        OR: input.search
          ? [
              { title: { contains: input.search, mode: 'insensitive' } },
              { content: { contains: input.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarImageFileUrl: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarImageFileUrl: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    await this.prisma.articles.update({
      where: { id },
      data: {
        viewCount: article.viewCount + 1,
      },
    });

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (updateArticleDto.categoryId) {
      const category = await this.prisma.categories.findUnique({
        where: {
          id: updateArticleDto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.articles.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  async remove(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.articles.delete({
      where: { id },
    });
  }

  async likeArticle(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.articles.update({
      where: { id },
      data: {
        likeCount: article.likeCount + 1,
      },
    });
  }
} 