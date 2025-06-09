import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { SearchInput } from '@shared/base-get-input';
import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CoursesService } from './courses.service';
import { CourseDto } from './dto/course.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { GetCourseMemberDto, GetCoursesDto } from './dto/get-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@ApiTags('Courses')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiResponse(CourseDto)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiArrayResponse(CourseDto)
  findAll(@Query() query: GetCoursesDto, @CurrentUser() user) {
    return this.coursesService.findAll(query);
  }

  @Get('/admin/all')
  @ApiArrayResponse(CourseDto)
  findAllAdmin(@Query() query: GetCoursesDto) {
    return this.coursesService.findAll(query);
  }

  @Get('/admin/get-by-slug/:slug')
  @ApiResponse(CourseDto)
  findOneAdmin(@Param('slug') slug: string) {
    return this.coursesService.findOneBySlug(slug);
  }

  @Get('/me')
  @ApiArrayResponse(CourseDto)
  findAllByStudent(@Query() query: GetCoursesDto, @CurrentUser() user) {
    return this.coursesService.findEnrolledCourse(user.id, query);
  }

  @Get('/not-enrolled')
  @ApiArrayResponse(CourseDto)
  findAllNotEnrolled(@Query() query: GetCoursesDto, @CurrentUser() user) {
    return this.coursesService.findNotEnrolledCourse(user.id, query);
  }

  @Get('/pending')
  @ApiArrayResponse(CourseDto)
  findAllPending(@Query() query: GetCoursesDto, @CurrentUser() user) {
    return this.coursesService.findPendingCourse(user.id, query);
  }

  @Get('/member')
  @ApiArrayResponse(CourseDto)
  getCourseMember(@Query() query: GetCourseMemberDto) {
    return this.coursesService.findCourseMember(query);
  }

  @Get(':id')
  @ApiResponse(CourseDto)
  findOne(@Param('id') id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse(CourseDto)
  update(@Param('id') id: number, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiResponse(Boolean)
  remove(@Param('id') id: number) {
    return this.coursesService.remove(id);
  }
}
