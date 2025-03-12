import { Injectable, Logger } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PaginatedData } from '@shared/paginated';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { DeleteManyCategoriesDto } from './dto/delete-many-category.dto';
import { GetCategoryDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(private readonly prisma: PrismaService) {}

  public async create(input: CreateCategoryDto) {
    return await this.prisma.categories.create({ data: input });
  }

  public async findAll(query: GetCategoryDto) {
    const where: Prisma.CategoriesWhereInput = {
      name: {
        contains: query.search,
        mode: 'insensitive',
      },
      parentId: query?.parentId ? query.parentId : undefined,
    };

    const total = await this.prisma.categories.count({ where: where });

    const items = await this.prisma.categories.findMany({
      where: where,
      skip: query.skip,
      take: query.take,
      orderBy: { createdAt: 'desc' },
    });
    return new PaginatedData(total, items);
  }

  public async findOne(id: number) {
    return await this.prisma.categories.findUnique({
      where: { id },
      include: { subCategories: true },
    });
  }

  public async update(id: number, input: UpdateCategoryDto) {
    return await this.prisma.categories.update({
      where: {
        id,
      },
      data: input,
    });
  }

  public async remove(id: number) {
    return await this.prisma.categories.delete({
      where: {
        id: id,
      },
    });
  }

  public async removeMany(input: DeleteManyCategoriesDto) {
    return await this.prisma.categories.deleteMany({
      where: {
        id: { in: input.ids },
      },
    });
  }
}
