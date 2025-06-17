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

  async findOneByUser(id: number, userId: number) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        enrollments: true,
        lessons: {
          include: {
            completions: {
              where: { userId },
              select: { isCompleted: true, completedAt: true },
            },
          },
        },
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
            lessons: {
              include: {
                completions: {
                  where: { userId },
                  select: { isCompleted: true, completedAt: true },
                },
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

  async getCourseUserProgress(courseId: number, userId: number) {
    // Get course and lessons with activities and completions
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        name: true,
        description: true,
        imageFileUrl: true,
        bannerFileUrl: true,
        status: true,
        category: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        activities: true,
        lessons: {
          select: {
            id: true,
            title: true,
            content: true,
            attachments: {
              select: {
                fileId: true,
                type: true,
                file: {
                  select: {
                    id: true,
                    fileName: true,
                    mimeType: true,
                    size: true,
                    storagePath: true,
                  },
                },
              },
            },
            completions: {
              where: { userId },
              select: { isCompleted: true, completedAt: true },
            },
            activities: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                dueDate: true,
                maxAttempts: true,
                passScore: true,
                timeLimitMinutes: true,
                createdAt: true,
                updatedAt: true,
                attempts: {
                  where: { studentId: userId },
                  select: {
                    id: true,
                    startedAt: true,
                    completedAt: true,
                    score: true,
                    gradingStatus: true,
                  },
                  orderBy: { startedAt: 'desc' },
                  take: 1, // Only latest attempt
                },
              },
            },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    // Calculate progress
    const totalLessons = course.lessons.length;
    const completedLessons = course.lessons.filter(
      (l) => l.completions.length > 0 && l.completions[0].isCompleted,
    ).length;
    const progress =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Format lessons with content and activity progress
    const lessons = course.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      content: l.content,
      attachments: l.attachments,
      isCompleted: l.completions.length > 0 && l.completions[0].isCompleted,
      completedAt: l.completions[0]?.completedAt,
      activities: l.activities.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        status: a.status,
        dueDate: a.dueDate,
        maxAttempts: a.maxAttempts,
        passScore: a.passScore,
        timeLimitMinutes: a.timeLimitMinutes,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        latestAttempt: a.attempts[0]
          ? {
              id: a.attempts[0].id,
              startedAt: a.attempts[0].startedAt,
              completedAt: a.attempts[0].completedAt,
              score: a.attempts[0].score,
              gradingStatus: a.attempts[0].gradingStatus,
            }
          : null,
      })),
    }));

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      status: course.status,
      category: course.category,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      imageFileUrl: course.imageFileUrl,
      bannerFileUrl: course.bannerFileUrl,
      activities: course.activities,
      progress,
      lessons,
    };
  }
}
