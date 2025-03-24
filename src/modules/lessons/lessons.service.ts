import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonDto } from './dto/get-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(input: CreateLessonDto) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: input.courseId,
      },
    });
    if (!course) {
      throw new Error('Course not found');
    }
    return this.prisma.lesson.create({
      data: input,
    });
  }

  async findAll(input: GetLessonDto) {
    return this.prisma.lesson.findMany({
      where: {
        courseId: input.courseId ? input.courseId : undefined,
        previousId: input.previousId ? +input.previousId : undefined,
        status: input.status ? input.status : undefined,
        title: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: input.order,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.lesson.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        courseId: true,
        previousId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isImportant: true,

        previous: {
          select: {
            id: true,
            title: true,
            isImportant: true,
          },
        },
        next: {
          select: {
            id: true,
            title: true,
            isImportant: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateLessonDto) {
    return this.prisma.lesson.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.lesson.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new NotFoundException('Lesson not found');
    }
  }
}
