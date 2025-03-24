import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { CourseDto } from './dto/course.dto';
import { ApiArrayResponse, ApiResponse } from '@shared/response';
import { GetCoursesDto } from './dto/get-courses.dto';
import { CurrentUser } from '@src/decorators/current-user.decorator';

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
