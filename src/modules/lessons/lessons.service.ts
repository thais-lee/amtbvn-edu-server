import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ActivityStatus, LessonAttachmentType } from '@prisma/client';

import { FilesService } from '@src/modules/files/files.service';
import { PrismaService } from '@src/prisma/prisma.service';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonDto } from './dto/get-lesson.dto';
import { LessonWithAttachments } from './dto/lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async create(input: CreateLessonDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
    });
    if (!course) throw new Error('Course not found');

    const { mediaFileIds = [], documentFileIds = [], ...lessonData } = input;
    const lesson = await this.prisma.lesson.create({ data: lessonData });

    // Attach media files (type: VIDEO or AUDIO)
    for (const fileId of mediaFileIds) {
      const file = await this.prisma.file.findUnique({ where: { id: fileId } });
      if (!file) continue;
      let type: LessonAttachmentType = LessonAttachmentType.VIDEO;
      if (file.mimeType.startsWith('audio/')) type = LessonAttachmentType.AUDIO;
      else if (file.mimeType.startsWith('video/'))
        type = LessonAttachmentType.VIDEO;
      await this.prisma.lessonAttachment.create({
        data: { lessonId: lesson.id, fileId, type },
      });
    }
    // Attach document files (type: DOCUMENT)
    for (const fileId of documentFileIds) {
      await this.prisma.lessonAttachment.create({
        data: {
          lessonId: lesson.id,
          fileId,
          type: LessonAttachmentType.DOCUMENT,
        },
      });
    }
    return lesson;
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

  async userFindAll(input: GetLessonDto, userId: number) {
    const lessons = await this.prisma.lesson.findMany({
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
      include: {
        _count: {
          select: {
            activities: true,
            attachments: true,
          },
        },
        // If you track completion per user, e.g., lessonCompletions table:
        completions: userId
          ? {
              where: { userId },
              select: { isCompleted: true },
            }
          : false,
      },
    });

    // Map to desired shape
    const data = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      status: lesson.status,
      isImportant: lesson.isImportant,
      activitiesCount: lesson._count.activities,
      attachmentsCount: lesson._count.attachments,
      previousId: lesson.previousId,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      isCompleted:
        lesson.completions && lesson.completions.length > 0
          ? lesson.completions[0].isCompleted
          : false,
    }));

    return {
      data,
      total: data.length,
    };
  }

  async findOne(id: number) {
    const lesson = (await this.prisma.lesson.findUnique({
      where: { id },
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
          select: { id: true, title: true, isImportant: true },
        },
        next: {
          select: { id: true, title: true, isImportant: true },
        },
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
                uploadedBy: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        activities: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            status: true,
            timeLimitMinutes: true,
            dueDate: true,
            maxAttempts: true,
            passScore: true,
            shuffleQuestions: true,
            createdAt: true,
            updatedAt: true,
            materials: {
              select: {
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
          },
        },
      },
    })) as LessonWithAttachments | null;
    if (!lesson) return null;

    // Find the first video attachment
    const videoAtt = lesson.attachments.find(
      (att) => att.type === 'VIDEO' && att.file?.mimeType?.startsWith('video/'),
    );
    let videoAttachment = null;
    if (videoAtt) {
      const presigned = await this.filesService.getPresignedUrlById(
        videoAtt.fileId,
      );
      videoAttachment = {
        ...videoAtt,
        file: {
          ...videoAtt.file,
          presignedUrl: presigned,
        },
      };
    }

    // Get presigned URLs for activity materials
    const activitiesWithPresignedUrls = await Promise.all(
      lesson.activities.map(async (activity) => ({
        ...activity,
        materials: await Promise.all(
          activity.materials.map(async (material) => ({
            ...material,
            file: {
              ...material.file,
              presignedUrl: await this.filesService.getPresignedUrlById(
                material.file.id,
              ),
            },
          })),
        ),
      })),
    );

    return {
      ...lesson,
      videoAttachment,
      activities: activitiesWithPresignedUrls,
    };
  }

  async update(id: number, data: UpdateLessonDto) {
    const { mediaFileIds, documentFileIds, ...lessonData } = data;

    delete lessonData.previousId;
    // Update the lesson data
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...lessonData,
      },
    });

    // Only update attachments if mediaFileIds or documentFileIds are provided
    if (mediaFileIds !== undefined || documentFileIds !== undefined) {
      // Remove old attachments
      await this.prisma.lessonAttachment.deleteMany({
        where: { lessonId: id },
      });

      // Add new media attachments
      if (mediaFileIds) {
        for (const fileId of mediaFileIds) {
          const file = await this.prisma.file.findUnique({
            where: { id: fileId },
          });
          if (!file) continue;
          let type: LessonAttachmentType = LessonAttachmentType.VIDEO;
          if (file.mimeType.startsWith('audio/'))
            type = LessonAttachmentType.AUDIO;
          else if (file.mimeType.startsWith('video/'))
            type = LessonAttachmentType.VIDEO;
          await this.prisma.lessonAttachment.create({
            data: { lessonId: lesson.id, fileId, type },
          });
        }
      }

      // Add new document attachments
      if (documentFileIds) {
        for (const fileId of documentFileIds) {
          await this.prisma.lessonAttachment.create({
            data: {
              lessonId: lesson.id,
              fileId,
              type: LessonAttachmentType.DOCUMENT,
            },
          });
        }
      }
    }

    return lesson;
  }

  async remove(id: number) {
    try {
      return await this.prisma.lesson.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Lesson not found');
    }
  }
}
