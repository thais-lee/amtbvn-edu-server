import {
  Body,
  Controller,
  Delete,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ERole } from '@prisma/client';
import { Request } from 'express';

import { ActivityService } from '@modules/activities/activity.service';
import { CreateActivityDto } from '@modules/activities/dto/create-activity.dto';
import { GetActivityDto } from '@modules/activities/dto/get-lesson-activity.dto';
import { UpdateActivityDto } from '@modules/activities/dto/update-activity.dto';
import { UserBasicDto } from '@modules/users/dto/user.dto';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { userFromContext } from '@src/shared/user-from-context';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonDto } from './dto/get-lesson.dto';
import { LessonDetailDto, LessonDto } from './dto/lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('Lessons')
@Controller('lessons')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly activityService: ActivityService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ type: LessonDetailDto })
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  async create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Get all lessons' })
  @ApiResponse({ type: [LessonDto] })
  async adminFindAll(@Query() query: GetLessonDto) {
    return this.lessonsService.findAll(query);
  }
  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User get all lessons' })
  @ApiResponse({ type: [LessonDto] })
  async userFindAll(
    @Query() query: GetLessonDto,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.lessonsService.userFindAll(query, user.id);
  }

  @Get('user/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User get a lesson by id' })
  @ApiResponse({ type: LessonDetailDto })
  async userFindOne(
    @Param('id') id: string,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.lessonsService.userFindOne(+id, user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a lesson by id' })
  @ApiResponse({ type: LessonDetailDto })
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiResponse({ type: LessonDetailDto })
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(+id, updateLessonDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ type: Boolean })
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  async remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }

  @Post(':id/activities')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Create a new activity in a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async createActivity(
    @Param('id') id: string,
    @Body() createActivityDto: CreateActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.create(
      {
        ...createActivityDto,
        lessonId: +id,
      },
      files,
      user.id,
    );
  }

  @Get(':id/activities')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all activities in a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async getActivities(@Param('id') id: string, @Query() query: GetActivityDto) {
    return this.activityService.findAll({
      ...query,
      lessonId: +id,
    });
  }

  @Patch(':lessonId/activities/:activityId')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Update an activity in a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'activityId', description: 'Activity ID' })
  async updateActivity(
    @Param('lessonId') lessonId: string,
    @Param('activityId') activityId: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const user = userFromContext(req as unknown as ExecutionContext);
    return this.activityService.update(
      +activityId,
      {
        ...updateActivityDto,
        lessonId: +lessonId,
      },
      files,
      user.id,
    );
  }

  @Delete(':lessonId/activities/:activityId')
  @ApiBearerAuth()
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Delete an activity from a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'activityId', description: 'Activity ID' })
  async deleteActivity(
    @Param('lessonId') lessonId: string,
    @Param('activityId') activityId: string,
  ) {
    return this.activityService.remove(+activityId);
  }

  @Patch(':id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lesson as completed for current user' })
  async completeLesson(
    @Param('id') id: string,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.lessonsService.completeLesson(+id, user.id);
  }
}
