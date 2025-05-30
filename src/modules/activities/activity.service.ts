import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ActivityStatus, File, Prisma } from '@prisma/client';

import { BufferedFile } from '@modules/files/dto/file.dto';
import { FilesService } from '@modules/files/files.service';

import { PrismaService } from '@src/prisma/prisma.service';

import {
  GetActivityAttemptsDto,
  StartActivityAttemptDto,
  SubmitActivityAttemptDto,
} from './dto/activity-attempt.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { GetActivityDto } from './dto/get-lesson-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  private readonly logger: Logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    // Validate that either courseId or lessonId is provided
    if (!createActivityDto.courseId && !createActivityDto.lessonId) {
      throw new BadRequestException(
        'Either courseId or lessonId must be provided',
      );
    }

    // Validate that not both courseId and lessonId are provided
    if (createActivityDto.courseId && createActivityDto.lessonId) {
      throw new BadRequestException(
        'Only one of courseId or lessonId can be provided',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Check if lesson exists if lessonId is provided
      if (createActivityDto.lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: createActivityDto.lessonId },
        });
        if (!lesson) {
          throw new NotFoundException('Lesson not found');
        }
      }

      // Check if course exists if courseId is provided
      if (createActivityDto.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: createActivityDto.courseId },
        });
        if (!course) {
          throw new NotFoundException('Course not found');
        }
      }

      const activity = await prisma.activity.create({
        data: {
          title: createActivityDto.title,
          description: createActivityDto.description,
          type: createActivityDto.type,
          timeLimitMinutes: createActivityDto.timeLimitMinutes,
          dueDate: createActivityDto.dueDate,
          maxAttempts: createActivityDto.maxAttempts,
          passScore: createActivityDto.passScore,
          shuffleQuestions: createActivityDto.shuffleQuestions,
          creatorId: userId,
          courseId: createActivityDto.courseId
            ? createActivityDto.courseId
            : null,
          lessonId: createActivityDto.courseId
            ? null
            : createActivityDto.lessonId,
          status: ActivityStatus.DRAFT,
          questions: {
            create: createActivityDto.questions.map((question) => ({
              question: question.question,
              type: question.type,
              points: question.points,
              options: {
                create: question.options.map((option) => ({
                  text: option.text,
                  isCorrect: option.isCorrect,
                })),
              },
            })),
          },
        },
      });

      let createdFilesData: { fileRecord: File; storedPath: string }[] = [];
      try {
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
          }
        }

        if (createdFilesData.length > 0) {
          await prisma.activityMaterial.createMany({
            data: createdFilesData.map((fileData) => ({
              activityId: activity.id,
              fileId: fileData.fileRecord.id,
            })),
          });
        }

        const result = await prisma.activity.findUniqueOrThrow({
          where: { id: activity.id },
          include: {
            materials: {
              include: {
                File: true,
              },
            },
          },
        });
        return result;
      } catch (error) {
        this.logger.error(`Failed to create activity: ${error.stack}`);

        if (createdFilesData.length > 0) {
          this.logger.warn(
            `Rolling back file uploads for failed activity creation...`,
          );
          for (const fileData of createdFilesData) {
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
          throw new InternalServerErrorException(
            `Database error: ${error.code}`,
          );
        }
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException ||
          error instanceof InternalServerErrorException
        ) {
          throw error;
        }
        throw new InternalServerErrorException('An unexpected error occurred.');
      }
    });
  }

  async findAll(input: GetActivityDto) {
    return this.prisma.activity.findMany({
      where: {
        courseId: input.courseId ? input.courseId : undefined,
        lessonId: input.lessonId ? input.lessonId : undefined,
        type: input.type ? input.type : undefined,
        title: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        [input.sort]: input.order,
        createdAt: 'desc',
      },
      include: {
        materials: {
          include: {
            File: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
      take: input.take,
      skip: input.skip,
    });
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: {
        id,
      },
      include: {
        materials: {
          include: {
            File: true,
          },
        },
      },
    });
    return activity;
  }

  async update(
    id: number,
    input: UpdateActivityDto,
    files: Array<Express.Multer.File> = [],
    userId: number,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if activity exists
      const existingActivity = await prisma.activity.findUnique({
        where: { id },
        include: {
          materials: {
            include: {
              File: true,
            },
          },
        },
      });

      if (!existingActivity) {
        throw new NotFoundException('Activity not found');
      }

      // Check if lesson exists if lessonId is being updated
      if (input.lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: input.lessonId },
        });
        if (!lesson) {
          throw new NotFoundException('Lesson not found');
        }
      }

      // Check if course exists if courseId is being updated
      if (input.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: input.courseId },
        });
        if (!course) {
          throw new NotFoundException('Course not found');
        }
      }

      // Handle file removals
      if (input.fileIdsToRemove && input.fileIdsToRemove.length > 0) {
        const filesToRemove = existingActivity.materials.filter((material) =>
          input.fileIdsToRemove.includes(material.fileId),
        );

        for (const material of filesToRemove) {
          await this.filesService.remove(material.File.storagePath);
          await prisma.activityMaterial.delete({
            where: {
              activityId_fileId: {
                activityId: id,
                fileId: material.fileId,
              },
            },
          });
          await prisma.file.delete({
            where: { id: material.fileId },
          });
        }
      }

      // Handle file uploads
      let createdFilesData: { fileRecord: File; storedPath: string }[] = [];
      try {
        if (files && files.length > 0) {
          for (const file of files) {
            const savedFileData = await this.filesService.uploadFile(
              file,
              'activity',
            );
            if (!savedFileData) {
              throw new InternalServerErrorException('Failed to save file');
            }

            const fileRecord = await prisma.file.create({
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
          }
        }

        // Update activity
        const updatedActivity = await prisma.activity.update({
          where: { id },
          data: {
            ...input,
            materials:
              createdFilesData.length > 0
                ? {
                    createMany: {
                      data: createdFilesData.map((fileData) => ({
                        fileId: fileData.fileRecord.id,
                      })),
                    },
                  }
                : undefined,
          },
          include: {
            materials: {
              include: {
                File: true,
              },
            },
            questions: {
              include: {
                options: true,
              },
            },
          },
        });

        return updatedActivity;
      } catch (error) {
        // Rollback file uploads if activity update fails
        if (createdFilesData.length > 0) {
          this.logger.warn(
            `Rolling back file uploads for failed activity update...`,
          );
          for (const fileData of createdFilesData) {
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
          throw new InternalServerErrorException(
            `Database error: ${error.code}`,
          );
        }
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException ||
          error instanceof InternalServerErrorException
        ) {
          throw error;
        }
        throw new InternalServerErrorException('An unexpected error occurred.');
      }
    });
  }

  async updateFiles(id: number, files: Array<Express.Multer.File> = []) {}

  async remove(id: number) {
    return this.prisma.activity.delete({
      where: {
        id,
      },
    });
  }

  async startAttempt(input: StartActivityAttemptDto, studentId: number) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if activity exists and is published
      const activity = await prisma.activity.findUnique({
        where: { id: input.activityId },
        include: {
          questions: true,
        },
      });

      if (!activity) {
        throw new NotFoundException('Activity not found');
      }

      if (activity.status !== ActivityStatus.PUBLISHED) {
        throw new BadRequestException('Activity is not published');
      }

      // Check if student has reached max attempts
      const attemptsCount = await prisma.activityAttempt.count({
        where: {
          activityId: input.activityId,
          studentId: studentId,
        },
      });

      if (attemptsCount >= activity.maxAttempts) {
        throw new BadRequestException('Maximum attempts reached');
      }

      // Check if there's an ongoing attempt
      const ongoingAttempt = await prisma.activityAttempt.findFirst({
        where: {
          activityId: input.activityId,
          studentId: studentId,
          completedAt: null,
        },
      });

      if (ongoingAttempt) {
        throw new BadRequestException('You have an ongoing attempt');
      }

      // Create new attempt
      const attempt = await prisma.activityAttempt.create({
        data: {
          activityId: input.activityId,
          studentId: studentId,
          startedAt: new Date(),
        },
        include: {
          Activity: {
            include: {
              questions: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      return attempt;
    });
  }

  async submitAttempt(
    attemptId: number,
    input: SubmitActivityAttemptDto,
    studentId: number,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if attempt exists and belongs to student
      const attempt = await prisma.activityAttempt.findUnique({
        where: { id: attemptId },
        include: {
          Activity: true,
        },
      });

      if (!attempt) {
        throw new NotFoundException('Attempt not found');
      }

      if (attempt.studentId !== studentId) {
        throw new BadRequestException('This attempt does not belong to you');
      }

      if (attempt.completedAt) {
        throw new BadRequestException(
          'This attempt has already been submitted',
        );
      }

      // Check if time limit has been exceeded
      const now = new Date();
      const startedAt = new Date(attempt.startedAt);
      const timeElapsed = (now.getTime() - startedAt.getTime()) / (1000 * 60);

      if (timeElapsed > attempt.Activity.timeLimitMinutes) {
        throw new BadRequestException('Time limit exceeded');
      }

      // Calculate score
      let totalScore = 0;
      const answers = [];

      for (const answer of input.answers) {
        const question = await prisma.activityQuestion.findUnique({
          where: { id: answer.questionId },
        });

        if (!question) {
          throw new NotFoundException(
            `Question ${answer.questionId} not found`,
          );
        }

        const isCorrect = answer.answer === question.correctAnswer;
        const score = isCorrect ? question.points : 0;
        totalScore += score;

        answers.push({
          activityAttemptId: attemptId,
          activityQuestionId: answer.questionId,
          answer: answer.answer,
          isCorrect,
          score,
        });
      }

      // Create answers and update attempt
      await prisma.studentAnswer.createMany({
        data: answers,
      });

      const updatedAttempt = await prisma.activityAttempt.update({
        where: { id: attemptId },
        data: {
          completedAt: now,
          score: totalScore,
        },
        include: {
          answers: {
            include: {
              Question: true,
            },
          },
          Activity: true,
        },
      });

      return updatedAttempt;
    });
  }

  async getAttempts(input: GetActivityAttemptsDto, studentId: number) {
    const where: Prisma.ActivityAttemptWhereInput = {
      studentId: input.studentId || studentId,
    };

    if (input.activityId) {
      where.activityId = input.activityId;
    }

    return this.prisma.activityAttempt.findMany({
      where,
      include: {
        Activity: true,
        answers: {
          include: {
            Question: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  async getAttempt(attemptId: number, studentId: number) {
    const attempt = await this.prisma.activityAttempt.findUnique({
      where: { id: attemptId },
      include: {
        Activity: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            Question: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.studentId !== studentId) {
      throw new BadRequestException('This attempt does not belong to you');
    }

    return attempt;
  }
}
