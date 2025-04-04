import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateCourseDto } from './dto/create-course.dto';
import { GetCoursesDto } from './dto/get-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateCourseDto) {
    const category = await this.prisma.categories.findUnique({
      where: {
        id: input.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.prisma.course.create({
      data: input,
    });
  }

  async findAll(input: GetCoursesDto) {
    return this.prisma.course.findMany({
      where: {
        name: input.search
          ? {
              contains: input.search,
              mode: 'insensitive',
            }
          : undefined,
        categoryId: input.categoryId ? input.categoryId : undefined,
        status: input.status ? input.status : undefined,
      },
      orderBy: {
        createdAt: input.order,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        enrollments: true,
        lessons: true,
        activities: true,
        libraryMaterialsUsed: true,
      },
    });
  }

  async findCourseMember(courseId: number) {
    return this.prisma.studentCourseEnrollment.findMany({
      where: {
        courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
            roles: true,
            avatarImageFileUrl: true,
            userLogin: {
              select: {
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async findEnrolledCourse(userId: number, input: GetCoursesDto) {
    return this.prisma.studentCourseEnrollment.findMany({
      where: {
        userId,
        course: {
          name: input.search
            ? {
                contains: input.search,
                mode: 'insensitive',
              }
            : undefined,
          categoryId: input.categoryId ? input.categoryId : undefined,
          status: input.status ? input.status : undefined,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            categoryId: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      return await this.prisma.course.update({
        where: {
          id,
        },
        data: updateCourseDto,
      });
    } catch (error) {
      throw new NotFoundException('Course not found');
    }
  }

  async remove(categoryId: number) {
    try {
      return await this.prisma.course.delete({
        where: {
          id: categoryId,
        },
      });
    } catch (error) {
      throw new NotFoundException('Course not found');
    }
  }
}
