import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { File, Prisma } from '@prisma/client';

import { BufferedFile } from '@modules/files/dto/file.dto';
import { FilesService } from '@modules/files/files.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateActivityDto } from './dto/create-activity.dto';
import { GetLessonExerciseDto } from './dto/get-lesson-activity.dto';
import { UpdateExerciseDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  private readonly logger: Logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async create(
    input: CreateActivityDto,
    files: Array<Express.Multer.File>,
    userId: number,
  ) {
    if (input.courseId) {
      const courseExists = await this.prisma.course.count({
        where: { id: input.courseId },
      });
      if (courseExists === 0)
        throw new NotFoundException(
          `Course with ID ${input.courseId} not found.`,
        );
    }
    if (input.lessonId) {
      const lessonExists = await this.prisma.lesson.count({
        where: { id: input.lessonId },
      });
      if (lessonExists === 0)
        throw new NotFoundException(
          `Lesson with ID ${input.lessonId} not found.`,
        );
    }

    let createdFilesData: { fileRecord: File; storedPath: string }[] = []; // Lưu cả record và path để rollback
    try {
      const createdActivities = await this.prisma.$transaction(async (tx) => {
        //Lưu file và tạo file record
        this.logger.log('Saving files...' + files?.length);
        if (files && files.length > 0) {
          for (const file of files) {
            const savedFileData = await this.filesService.uploadFile(
              file,
              'activity',
            );
            if (!savedFileData) {
              throw new InternalServerErrorException('Failed to save file');
            }
            this.logger.log('File saved: ' + file.originalname);
            
            const fileRecord = await this.prisma.file.create({
              data: {
                fileName: file.originalname,
                storagePath: savedFileData.filePath,
                mimeType: file.mimetype,
                size: file.size,
                uploadedBy: userId,
              },
            });
            createdFilesData.push({
              fileRecord,
              storedPath: savedFileData.filePath,
            });
            console.log(fileRecord);
          }
        }

        //Tạo activity
        const activity = await this.prisma.activity.create({
          data: {
            title: input.title,
            description: input.description,
            activityType: input.type,
            timeLimitMinutes: input.timeLimitMinutes,
            dueDate: input.dueDate,
            maxAttempts: input.maxAttempts,
            passScore: input.passScore,
            shuffleQuestions: input.shuffleQuestions,
            courseId: input.courseId,
            lessonId: input.lessonId,
            creatorId: userId,
          },
        });

        // 3. Tạo ActivityMaterial records để liên kết Activity và File
        if (createdFilesData.length > 0) {
          await tx.activityMaterial.createMany({
            data: createdFilesData.map((fileData) => ({
              activityId: activity.id,
              fileId: fileData.fileRecord.id,
            })),
          });
        }

        const result = await tx.activity.findUniqueOrThrow({
          // OrThrow để chắc chắn có kết quả
          where: { id: activity.id },
          include: {
            materials: {
              // Include bảng trung gian
              include: {
                File: true, // Include thông tin File chi tiết
              },
            },
          },
        });
        return result;
      });

      this.logger.log(
        `Activity created successfully with ID: ${createdActivities.id}`,
      );
      return createdActivities;
    } catch (error) {
      this.logger.error(`Failed to create activity: ${error.stack}`);

      // Rollback file uploads nếu có lỗi xảy ra sau khi đã lưu file
      if (createdFilesData.length > 0) {
        this.logger.warn(
          `Rolling back file uploads for failed activity creation...`,
        );
        for (const fileData of createdFilesData) {
          // Không dùng await ở đây để tránh block nếu xóa 1 file bị lỗi
          this.filesService
            .remove(fileData.storedPath)
            .catch((deleteError) =>
              this.logger.error(
                `Failed to delete uploaded file during rollback: ${fileData.storedPath}`,
                deleteError.stack,
              ),
            );
        }
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Xử lý các lỗi cụ thể của Prisma nếu cần
        throw new InternalServerErrorException(`Database error: ${error.code}`);
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error; // Ném lại các lỗi đã biết
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAll(input: GetLessonExerciseDto) {
    return this.prisma.activity.findMany({
      where: input,
    });
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: {
        id,
      },
    });

    // const file = await this.prisma..findMany({
    //   where: {
    //     itemType: FileItemType.LESSON_EXERCISE,
    //     itemId: id,
    //   },
    //   include: {
    //     file: {
    //       select: {
    //         id: true,
    //         fileName: true,
    //         storagePath: true,
    //         mimeType: true,
    //         size: true,
    //         uploadedBy: true,
    //         createdAt: true,
    //         updatedAt: true,
    //       },
    //     },
    //   }
    // })

    return {
      ...activity,
      file: null,
    };
  }

  async update(id: number, input: UpdateExerciseDto) {
    return this.prisma.activity.update({
      where: {
        id,
      },
      data: input,
    });
  }

  async remove(id: number) {
    return this.prisma.activity.delete({
      where: {
        id,
      },
    });
  }
}
