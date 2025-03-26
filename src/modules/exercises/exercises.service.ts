import { Injectable } from '@nestjs/common';

import { BufferedFile } from '@modules/files/dto/file.dto';
import { FilesService } from '@modules/files/files.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateExerciseDto } from './dto/create-exercise.dto';
import { GetLessonExerciseDto } from './dto/get-lesson-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async create(input: CreateExerciseDto, file: BufferedFile) {
    await this.filesService.uploadFile(file, 'test');

    return this.prisma.lessonExercise.create({
      data: input,
    });
  }

  async findAll(input: GetLessonExerciseDto) {
    return this.prisma.lessonExercise.findMany({
      where: input,
    });
  }

  async findOne(id: number) {
    return this.prisma.lessonExercise.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, input: UpdateExerciseDto) {
    return this.prisma.lessonExercise.update({
      where: {
        id,
      },
      data: input,
    });
  }

  async remove(id: number) {
    return this.prisma.lessonExercise.delete({
      where: {
        id,
      },
    });
  }
}
