import { Injectable } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { GetEnrollmentDto } from './dto/get-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEnrollmentDto: CreateEnrollmentDto) {
    return this.prisma.studentCourseEnrollment.create({
      data: createEnrollmentDto,
    });
  }

  findAll(input: GetEnrollmentDto) {
    return this.prisma.studentCourseEnrollment.findMany({
      where: {
        courseId: input.courseId ? input.courseId : undefined,
        userId: input.userId ? input.userId : undefined,
        status: input.status ? input.status : undefined,
      },
      orderBy: {
        enrolledAt: input.order ? input.order : 'desc',
      },
    });
  }

  async update(
    userId: number,
    courseId: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    const enroll = await this.prisma.studentCourseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    if (!enroll) {
      throw new Error('Enrollment not found');
    }

    return this.prisma.studentCourseEnrollment.update({
      where: {
        userId_courseId: {
          courseId,
          userId,
        },
      },
      data: updateEnrollmentDto,
    });
  }

  async remove(userId: number, courseId: number) {
    const enroll = await this.prisma.studentCourseEnrollment.findUnique({
      where: {
        userId_courseId: {
          courseId,
          userId,
        },
      },
    });
    if (!enroll) {
      throw new Error('Enrollment not found');
    }
    return this.prisma.studentCourseEnrollment.delete({
      where: {
        userId_courseId: {
          courseId,
          userId,
        },
      },
    });
  }
}
