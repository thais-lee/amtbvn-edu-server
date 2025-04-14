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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ERole } from '@prisma/client';

import { RolesAuth } from '@src/decorators/roles-auth.decorator';

import { CreateActivityDto } from './dto/create-activity.dto';
import { GetActivityDto } from './dto/get-lesson-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityService } from './activity.service';
import { GetActivityAttemptsDto, StartActivityAttemptDto, SubmitActivityAttemptDto } from './dto/activity-attempt.dto';

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
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @ApiQuery({ name: 'type', required: false, enum: ['QUIZ', 'ASSIGNMENT', 'DISCUSSION', 'PROJECT'] })
  @ApiQuery({ name: 'creatorId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: GetActivityDto) {
    return this.activityService.findAll(query);
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
  @RolesAuth([ERole.USER])
  @ApiOperation({ summary: 'Start a new activity attempt' })
  @ApiResponse({ status: 201, description: 'Attempt started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async startAttempt(@Body() input: StartActivityAttemptDto) {
    return this.activityService.startAttempt(input, 1); // TODO: Replace with actual student ID from auth
  }

  @Post('attempts/:id/submit')
  @RolesAuth([ERole.USER])
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
  ) {
    return this.activityService.submitAttempt(+id, input, 1); // TODO: Replace with actual student ID from auth
  }

  @Get('attempts')
  @RolesAuth([ERole.USER])
  @ApiOperation({ summary: 'Get activity attempts' })
  @ApiQuery({ name: 'activityId', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Attempts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAttempts(@Query() query: GetActivityAttemptsDto) {
    return this.activityService.getAttempts(query, 1); // TODO: Replace with actual student ID from auth
  }

  @Get('attempts/:id')
  @RolesAuth([ERole.USER])
  @ApiOperation({ summary: 'Get a single activity attempt' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attempt retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async getAttempt(@Param('id') id: string) {
    return this.activityService.getAttempt(+id, 1); // TODO: Replace with actual student ID from auth
  }
}
