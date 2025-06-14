import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EnrollmentStatus } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { GetEnrollmentDto } from './dto/get-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    await this.checkAlreadyEnrolled(
      createEnrollmentDto.userId,
      createEnrollmentDto.courseId,
    );

    const course = await this.checkCourseExists(createEnrollmentDto.courseId);

    if (!course.requireApproval) {
      createEnrollmentDto.status = EnrollmentStatus.ACCEPTED;
    }

    return this.prisma.studentCourseEnrollment.create({
      data: {
        courseId: createEnrollmentDto.courseId,
        userId: createEnrollmentDto.userId,
        status: createEnrollmentDto.status || EnrollmentStatus.PENDING,
      },
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

  async updateByUser(
    userId: number,
    courseId: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.update(userId, courseId, {
      status: EnrollmentStatus.PENDING,
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

  private async checkAlreadyEnrolled(userId: number, courseId: number) {
    const enroll = await this.prisma.studentCourseEnrollment.findUnique({
      where: {
        userId_courseId: {
          courseId,
          userId,
        },
      },
    });
    if (enroll) {
      throw new BadRequestException({ message: 'Already enrolled' });
    }
  }

  private async checkCourseExists(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }
}
