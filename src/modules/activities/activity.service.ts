import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ActivityStatus, File, GradingStatus, Prisma } from '@prisma/client';

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
import { GradeAttemptDto } from './dto/grade-attempt.dto';

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
            create: Array.isArray(createActivityDto.questions)
              ? createActivityDto.questions.map((question) => ({
                  question: question.question,
                  type: question.type,
                  points: question.points,
                  options: {
                    create: Array.isArray(question.options)
                      ? question.options.map((option) => ({
                          text: option.text,
                          isCorrect: option.isCorrect,
                        }))
                      : [],
                  },
                }))
              : [],
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
                file: true,
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
    const activities = await this.prisma.activity.findMany({
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
            file: true,
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

    const total = await this.prisma.activity.count({
      where: {
        courseId: input.courseId ? input.courseId : undefined,
        lessonId: input.lessonId ? input.lessonId : undefined,
        type: input.type ? input.type : undefined,
      },
    });
    return {
      items: activities,
      total,
    };
  }

  async userFindAll(input: GetActivityDto, userId: number) {
    return this.prisma.activity.findMany({
      where: {
        courseId: input.courseId ? input.courseId : undefined,
      },
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
            file: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
    return activity;
  }

  async userFindOne(id: number, userId: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { id, status: ActivityStatus.PUBLISHED },
      include: {
        materials: {
          include: {
            file: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
        attempts: {
          where: {
            studentId: userId,
          },
          include: {
            answers: true,
          },
        },
        _count: {
          select: {
            attempts: {
              where: {
                studentId: userId,
              },
            },
            questions: true,
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
              file: true,
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
          await this.filesService.remove(material.file.storagePath);
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

        // 1. Update the activity itself (including materials logic)
        const updatedActivity = await prisma.activity.update({
          where: { id },
          data: {
            title: input.title,
            description: input.description,
            type: input.type,
            status: input.status,
            timeLimitMinutes: input.timeLimitMinutes,
            courseId: input.courseId,
            lessonId: input.lessonId,
            dueDate: input.dueDate,
            maxAttempts: input.maxAttempts,
            passScore: input.passScore,
            materials:
              createdFilesData && createdFilesData.length > 0
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
                file: true,
              },
            },
            questions: {
              include: {
                options: true,
              },
            },
          },
        });

        // 2. Handle questions
        if (input.questions) {
          const questions = input.questions as any[]; // TUpdateQuestionDto[]
          // Get existing question IDs for this activity
          const existingQuestions = await this.prisma.activityQuestion.findMany(
            {
              where: { activityId: id },
              select: { id: true },
            },
          );
          const existingQuestionIds = existingQuestions.map((q) => q.id);
          const payloadQuestionIds = questions
            .filter((q) => q.id)
            .map((q) => q.id);

          // Delete questions that are not in the payload
          await this.prisma.activityQuestion.deleteMany({
            where: {
              activityId: id,
              id: { notIn: payloadQuestionIds },
            },
          });

          for (const q of questions) {
            if (q.id) {
              // Update existing question
              await this.prisma.activityQuestion.update({
                where: { id: q.id },
                data: {
                  question: q.question,
                  type: q.type,
                  points: q.points,
                },
              });

              // Handle options
              const options = (q.options ?? []) as any[]; // TUpdateQuestionOptionDto[]
              const existingOptions = await this.prisma.questionOption.findMany(
                {
                  where: { questionId: q.id },
                  select: { id: true },
                },
              );
              const existingOptionIds = existingOptions.map((o) => o.id);
              const payloadOptionIds = options
                .filter((o) => o.id)
                .map((o) => o.id);

              // Delete removed options
              await this.prisma.questionOption.deleteMany({
                where: {
                  questionId: q.id,
                  id: { notIn: payloadOptionIds },
                },
              });

              for (const opt of options) {
                if (opt.id) {
                  // Update existing option
                  await this.prisma.questionOption.update({
                    where: { id: opt.id },
                    data: {
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                    },
                  });
                } else {
                  // Create new option
                  await this.prisma.questionOption.create({
                    data: {
                      questionId: q.id,
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                    },
                  });
                }
              }
            } else {
              // Create new question (with options)
              await this.prisma.activityQuestion.create({
                data: {
                  activityId: id,
                  question: q.question,
                  type: q.type,
                  points: q.points,
                  options: {
                    create: (q.options ?? []).map((opt) => ({
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                    })),
                  },
                },
              });
            }
          }
        }

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
          _count: {
            select: {
              attempts: {
                where: {
                  studentId: studentId,
                },
              },
            },
          },
        },
      });

      if (!activity) {
        throw new NotFoundException('Activity not found');
      }

      if (activity.status !== ActivityStatus.PUBLISHED) {
        throw new BadRequestException('Activity is not published');
      }

      // Check if student has reached max attempts
      if (activity._count.attempts >= activity.maxAttempts) {
        throw new BadRequestException(
          `Bạn đã đạt số lần làm bài tối đa (${activity.maxAttempts})`,
        );
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
        throw new BadRequestException(
          'Bạn đang có một bài làm bài tập đang tiến hành',
        );
      }

      // Create new attempt
      const attempt = await prisma.activityAttempt.create({
        data: {
          activityId: input.activityId,
          studentId: studentId,
          startedAt: new Date(),
          attemptNumber: activity._count.attempts + 1,
        },
        include: {
          activity: {
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
          activity: true,
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

      if (timeElapsed > attempt.activity.timeLimitMinutes) {
        throw new BadRequestException('Time limit exceeded');
      }

      let totalScore = 0;
      const answers = [];
      let needsManualGrading = false;

      for (const answer of input.answers) {
        const question = await prisma.activityQuestion.findUnique({
          where: { id: answer.questionId },
          include: { options: true },
        });

        if (!question) {
          throw new NotFoundException(
            `Question ${answer.questionId} not found`,
          );
        }

        let isCorrect = null;
        let score = 0;
        if (
          attempt.activity.type === 'QUIZ' &&
          (question.type === 'TRUE_FALSE' ||
            question.type === 'MULTIPLE_CHOICE')
        ) {
          if (question.type === 'MULTIPLE_CHOICE') {
            // Find the correct option
            const correctOption = question.options.find((opt) => opt.isCorrect);
            isCorrect =
              correctOption &&
              String(answer.selectedOptionId) === String(correctOption.id);
            score = isCorrect ? question.points : 0;
            totalScore += score;
          } else if (question.type === 'TRUE_FALSE') {
            // Find the correct option (text is 'true' or 'false')
            const correctOption = question.options.find((opt) => opt.isCorrect);
            isCorrect =
              correctOption &&
              String(answer.answer) === String(correctOption.text);
            score = isCorrect ? question.points : 0;
            totalScore += score;
          }
        } else {
          // Needs manual grading
          needsManualGrading = true;
        }

        answers.push({
          activityAttemptId: attemptId,
          activityQuestionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId ?? null,
          answer: answer.answer ?? null,
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
          gradingStatus: needsManualGrading
            ? GradingStatus.PENDING_MANUAL
            : GradingStatus.GRADED,
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
          activity: true,
        },
      });

      if (attempt.activity.type === 'ASSIGNMENT') {
        return {
          success: true,
          message: 'Đã nộp bài thành công',
        };
      }
      return updatedAttempt;
    });
  }

  async getAttempts(input: GetActivityAttemptsDto, studentId: number) {
    const where: Prisma.ActivityAttemptWhereInput = {
      studentId,
    };

    if (input.activityId) {
      where.activityId = input.activityId;
    }

    return this.prisma.activityAttempt.findMany({
      where,
      include: {
        student: true,
        activity: true,
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });
  }

  async getAttempt(attemptId: number, studentId: number) {
    const attempt = await this.prisma.activityAttempt.findUnique({
      where: { id: attemptId },
      include: {
        activity: {
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
            question: true,
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

  async getAttemptResult(attemptId: number, studentId: number) {
    const attempt = await this.prisma.activityAttempt.findUnique({
      where: { id: attemptId },
      include: {
        activity: true,
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
        grader: true,
        student: true,
      },
    });

    return attempt;
  }

  async adminGetAttempts(input: GetActivityAttemptsDto) {
    const where: Prisma.ActivityAttemptWhereInput = {};

    if (input.activityId) {
      where.activityId = input.activityId;
    }

    const attempts = await this.prisma.activityAttempt.findMany({
      where,
      include: {
        student: true,
        activity: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: input.take ?? 20,
      skip: input.skip ?? 0,
    });

    const total = await this.prisma.activityAttempt.count({
      where,
    });

    return {
      items: attempts,
      total,
    };
  }

  async adminGetAttemptDetail(id: number) {
    const attempt = await this.prisma.activityAttempt.findUnique({
      where: { id },
      include: {
        activity: true,
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return attempt;
  }

  async gradeAttempt(id: number, input: GradeAttemptDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if attempt exists
      const attempt = await prisma.activityAttempt.findUnique({
        where: { id },
        include: {
          answers: true,
        },
      });

      if (!attempt) {
        throw new NotFoundException('Attempt not found');
      }

      // Update answers with scores and feedback
      for (const answerGrade of input.answers) {
        await prisma.studentAnswer.update({
          where: { id: answerGrade.id },
          data: {
            score: answerGrade.score,
            feedback: answerGrade.feedback,
          },
        });
      }

      // Calculate total score
      const totalScore = input.answers.reduce((sum, a) => sum + a.score, 0);

      // Update attempt with overall feedback and status
      const updatedAttempt = await prisma.activityAttempt.update({
        where: { id },
        data: {
          score: totalScore,
          graderFeedback: input.overallFeedback,
          gradingStatus: GradingStatus.GRADED,
          gradedAt: new Date(),
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
          activity: true,
          student: true,
        },
      });

      return updatedAttempt;
    });
  }
}
