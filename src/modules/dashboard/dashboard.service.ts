import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      userCount,
      courseCount,
      lessonCount,
      articleCount,
      libraryMaterialCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.lesson.count(),
      this.prisma.articles.count(),
      this.prisma.libraryMaterial.count(),
    ]);
    return {
      userCount,
      courseCount,
      lessonCount,
      articleCount,
      libraryMaterialCount,
    };
  }
}
