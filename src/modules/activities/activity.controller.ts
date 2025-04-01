import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ActivityType, User } from '@prisma/client';

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { ActivityService } from './activity.service';
import { LessonActivityDto } from './dto/activity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { GetLessonExerciseDto } from './dto/get-lesson-activity.dto';
import { UpdateExerciseDto } from './dto/update-activity.dto';

@Controller('activity')
@ApiTags('Activity')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [ActivityType.QUIZ, ActivityType.ASSIGNMENT],
        },
        title: { type: 'string' },
        description: { type: 'string' },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        timeLimitMinutes: { type: 'number' },
        dueDate: { type: 'string' },
        maxAttempts: { type: 'number' },
        passScore: { type: 'number' },
        shuffleQuestions: { type: 'boolean' },
        courseId: { type: 'number' },
        lessonId: { type: 'number' },
        creatorId: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse(LessonActivityDto)
  create(
    @Body() createExerciseDto: CreateActivityDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() user: User,
  ) {
    return this.activityService.create(createExerciseDto, files, createExerciseDto.creatorId);
  }

  @Get()
  @ApiArrayResponse(LessonActivityDto)
  findAll(@Query() query: GetLessonExerciseDto) {
    return this.activityService.findAll(query);
  }

  @Get(':id')
  @ApiResponse(LessonActivityDto)
  findOne(@Param('id') id: number) {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse(LessonActivityDto)
  update(
    @Param('id') id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.activityService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @ApiResponse(LessonActivityDto)
  remove(@Param('id') id: number) {
    return this.activityService.remove(id);
  }
}
