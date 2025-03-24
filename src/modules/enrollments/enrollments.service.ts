import { Injectable } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { GetEnrollmentDto } from './dto/get-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEnrollmentDto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: createEnrollmentDto,
    });
  }

  findAll(input: GetEnrollmentDto) {
    return this.prisma.enrollment.findMany({
      where: {
        courseId: input.courseId ? input.courseId : undefined,
        userId: input.userId ? input.userId : undefined,
        status: input.status ? input.status : undefined,
      },
      orderBy: {
        createdAt: input.order ? input.order : 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.enrollment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarImageFileUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            imageFileUrl: true,
          },
        },
      },
    });
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enroll = await this.prisma.enrollment.findUnique({
      where: {
        id,
      },
    });
    if (!enroll) {
      throw new Error('Enrollment not found');
    }

    return this.prisma.enrollment.update({
      where: {
        id,
      },
      data: updateEnrollmentDto,
    });
  }

  async remove(id: number) {
    const enroll = await this.prisma.enrollment.findUnique({
      where: {
        id,
      },
    });
    if (!enroll) {
      throw new Error('Enrollment not found');
    }
    return this.prisma.enrollment.delete({
      where: {
        id,
      },
    });
  }
}
