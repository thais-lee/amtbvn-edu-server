import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ArticleStatus, ArticlesType, Prisma } from '@prisma/client';

import { FilesService } from '@modules/files/files.service';

import { PrismaService } from '@src/prisma/prisma.service';

import {
  CreateArticleDto,
  GetArticlesDto,
  UpdateArticleDto,
} from './dto/article.dto';
import { DeleteManyArticleDto } from './dto/delete-many-article';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: number) {
    const { images, ...articleData } = createArticleDto;

    // Check if category exists
    const category = await this.prisma.categories.findUnique({
      where: {
        id: articleData.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Create article with images
    const article = await this.prisma.articles.create({
      data: {
        ...articleData,
        userId,
        status: articleData.status || ArticleStatus.DRAFT,
        images: {
          create:
            images?.map((img) => ({
              fileId: img.fileId,
              order: img.order || 0,
            })) || [],
        },
      },
      include: {
        images: {
          include: {
            file: true,
          },
        },
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

    return article;
  }

  async findAll(getArticlesDto: GetArticlesDto) {
    const { categoryId, type, status, search } = getArticlesDto;

    const where: Prisma.ArticlesWhereInput = {
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const items = await this.prisma.articles.findMany({
      where,
      take: getArticlesDto.take || 10,
      skip: getArticlesDto.skip || 0,
      include: {
        images: {
          include: {
            file: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.articles.count({ where });
    return {
      items,
      total,
    };
  }

  async findOne(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        images: {
          include: {
            file: true,
          },
        },
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
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const { images, ...articleData } = updateArticleDto;

    // Check if article exists
    const existingArticle = await this.prisma.articles.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    // If category is being updated, check if it exists
    if (articleData.categoryId) {
      const category = await this.prisma.categories.findUnique({
        where: {
          id: articleData.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Update article with images
    const article = await this.prisma.articles.update({
      where: { id },
      data: {
        ...articleData,
        images: {
          deleteMany: {},
          create:
            images?.map((img) => ({
              fileId: img.fileId,
              order: img.order || 0,
            })) || [],
        },
      },
      include: {
        images: {
          include: {
            file: true,
          },
        },
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

    return article;
  }

  async deleteOne(id: number) {
    const article = await this.findOne(id);

    // Delete article and its images
    await this.filesService.remove(article.thumbnailUrl.split('/').pop());
    await this.prisma.articles.delete({
      where: { id },
    });

    return article;
  }

  async deleteMany(input: DeleteManyArticleDto) {
    const articles = await this.prisma.articles.findMany({
      where: {
        id: {
          in: input.ids,
        },
      },
    });

    for (const article of articles) {
      await this.deleteOne(article.id);
    }

    return true;
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
      data: { likeCount: { increment: 1 } },
    });
  }
}
