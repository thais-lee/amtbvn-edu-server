import { Injectable, NotFoundException } from '@nestjs/common';

import { EnrollmentStatus } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateCourseDto } from './dto/create-course.dto';
import { GetCourseMemberDto, GetCoursesDto } from './dto/get-courses.dto';
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
      data: {
        ...input,
      },
    });
  }

  async findAll(input: GetCoursesDto) {
    const courses = await this.prisma.course.findMany({
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
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: {
                status: EnrollmentStatus.ACCEPTED,
              },
            },
            lessons: true,
          },
        },
      },
    });

    return {
      items: courses,
      total: courses.length,
    };
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

  async findNotEnrolledCourse(userId: number, input: GetCoursesDto) {
    const courses = await this.prisma.course.findMany({
      where: {
        enrollments: {
          none: {
            userId,
          },
        },
        categoryId: input.categoryId ? input.categoryId : undefined,
        status: input.status ? input.status : undefined,
        requireApproval: input.requireApproval
          ? input.requireApproval
          : undefined,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: {
              where: {
                status: EnrollmentStatus.ACCEPTED,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: input.order ? input.order : 'desc',
      },
      // skip: input.skip,
      // take: input.take,
    });

    return {
      items: courses,
      total: courses.length,
    };
  }

  async findPendingCourse(userId: number, input: GetCoursesDto) {
    const courses = await this.prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            userId,
            status: {
              in: [EnrollmentStatus.PENDING, EnrollmentStatus.REJECTED],
            },
          },
        },
        categoryId: input.categoryId ? input.categoryId : undefined,
        status: input.status ? input.status : undefined,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        enrollments: {
          where: {
            userId,
            status: {
              in: [EnrollmentStatus.PENDING, EnrollmentStatus.REJECTED],
            },
          },
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: {
              where: {
                status: EnrollmentStatus.ACCEPTED,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: input.order ? input.order : 'desc',
      },
    });

    return {
      items: courses,
      total: courses.length,
    };
  }

  async findOneBySlug(slug: string) {
    return this.prisma.course.findUnique({
      where: {
        slug,
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

  async findCourseMember(input: GetCourseMemberDto) {
    const enrollments = await this.prisma.studentCourseEnrollment.findMany({
      where: {
        courseId: input.courseId,
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
      skip: input.skip,
      take: input.take,
      orderBy: {
        enrolledAt: input.order ? input.order : 'desc',
      },
    });

    return {
      items: enrollments,
      total: enrollments.length,
    };
  }

  async findEnrolledCourse(userId: number, input: GetCoursesDto) {
    const enrollments = await this.prisma.studentCourseEnrollment.findMany({
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
        status: EnrollmentStatus.ACCEPTED,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            categoryId: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            imageFileUrl: true,
            bannerFileUrl: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      items: enrollments,
      total: enrollments.length,
    };
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
