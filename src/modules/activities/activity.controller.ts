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

import { UserBasicDto } from '@modules/users/dto/user.dto';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { ActivityService } from './activity.service';
import {
  GetActivityAttemptsDto,
  StartActivityAttemptDto,
  SubmitActivityAttemptDto,
} from './dto/activity-attempt.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { GetActivityDto } from './dto/get-lesson-activity.dto';
import { GradeAttemptDto } from './dto/grade-attempt.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller('activities')
@ApiTags('Activities')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.activityService.create(createActivityDto, files, 1);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'lessonId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['QUIZ', 'ASSIGNMENT', 'DISCUSSION', 'PROJECT'],
  })
  @ApiQuery({ name: 'creatorId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: GetActivityDto) {
    return this.activityService.findAll(query);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all activities' })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'lessonId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['QUIZ', 'ASSIGNMENT', 'DISCUSSION', 'PROJECT'],
  })
  @ApiQuery({ name: 'creatorId', required: false, type: Number })
  async userFindAll(
    @Query() query: GetActivityDto,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.userFindAll(query, user.id);
  }

  @Get('attempts')
  @RolesAuth([ERole.USER, ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Get activity attempts' })
  @ApiQuery({ name: 'activityId', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Attempts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAttempts(
    @Query() query: GetActivityAttemptsDto,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.getAttempts(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single activity by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'User get a single activity by ID' })
  async userFindOne(
    @Param('id') id: number,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.userFindOne(+id, user.id);
  }

  @Patch(':id')
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Update an activity' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.activityService.update(+id, updateActivityDto, files, 1);
  }

  @Delete(':id')
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }

  @Post('attempts/start')
  @RolesAuth([ERole.USER, ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Start a new activity attempt' })
  @ApiResponse({ status: 201, description: 'Attempt started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async startAttempt(
    @Body() input: StartActivityAttemptDto,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.startAttempt(input, user.id);
  }

  @Post('attempts/:id/submit')
  @RolesAuth([ERole.USER, ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Submit an activity attempt' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attempt submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async submitAttempt(
    @Param('id') id: string,
    @Body() input: SubmitActivityAttemptDto,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.submitAttempt(+id, input, user.id);
  }

  @Get('attempts/:id')
  @RolesAuth([ERole.USER, ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Get a single activity attempt' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attempt retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async getAttempt(@Param('id') id: string, @CurrentUser() user: UserBasicDto) {
    return this.activityService.getAttempt(+id, user.id); // TODO: Replace with actual student ID from auth
  }

  @Get('attempts/:id/result')
  @RolesAuth([ERole.USER, ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Get a single activity attempt result' })
  async getAttemptResult(
    @Param('id') id: number,
    @CurrentUser() user: UserBasicDto,
  ) {
    return this.activityService.getAttemptResult(+id, user.id);
  }

  @Get('attempts/admin/list')
  @RolesAuth([ERole.USER, ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Admin get activity attempts' })
  @ApiQuery({ name: 'activityId', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Attempts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async adminGetAttempts(@Query() query: GetActivityAttemptsDto) {
    return this.activityService.adminGetAttempts(query);
  }

  @Get('attempts/admin/:id')
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Admin get a single activity attempt' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attempt retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async adminGetAttemptDetail(@Param('id') id: string) {
    return this.activityService.adminGetAttemptDetail(+id);
  }

  @Post('attempts/admin/:id/grade')
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @ApiOperation({ summary: 'Grade an activity attempt' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attempt graded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async gradeAttempt(@Param('id') id: string, @Body() input: GradeAttemptDto) {
    return this.activityService.gradeAttempt(+id, input);
  }
}
