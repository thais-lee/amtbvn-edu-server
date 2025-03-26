import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { BufferedFile } from '@modules/files/dto/file.dto';

import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateExerciseDto } from './dto/create-exercise.dto';
import { LessonExerciseDto } from './dto/exercise.dto';
import { GetLessonExerciseDto } from './dto/get-lesson-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
import { ExerciseType } from '@prisma/client';

@Controller('exercises')
@ApiTags('Exercises')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lessonId: { type: 'number' },
        type: { type: 'string', enum: [ExerciseType.ESSAY, ExerciseType.MCQ] },
        title: { type: 'string' },
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse(LessonExerciseDto)
  create(
    @Body() createExerciseDto: CreateExerciseDto,
    @UploadedFile() file: BufferedFile,
  ) {
    return this.exercisesService.create(createExerciseDto, file);
  }

  @Get()
  @ApiArrayResponse(LessonExerciseDto)
  findAll(@Query() query: GetLessonExerciseDto) {
    return this.exercisesService.findAll(query);
  }

  @Get(':id')
  @ApiResponse(LessonExerciseDto)
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse(LessonExerciseDto)
  update(
    @Param('id') id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @ApiResponse(LessonExerciseDto)
  remove(@Param('id') id: number) {
    return this.exercisesService.remove(id);
  }
}
