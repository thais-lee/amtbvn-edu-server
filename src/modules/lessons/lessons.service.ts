import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LessonAttachmentType } from '@prisma/client';

import { FilesService } from '@src/modules/files/files.service';
import { PrismaService } from '@src/prisma/prisma.service';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonDto } from './dto/get-lesson.dto';
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

  async findOne(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
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
      },
    });
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

    return {
      ...lesson,
      videoAttachment,
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
