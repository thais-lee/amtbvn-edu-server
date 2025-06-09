import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { GetLessonDto } from './dto/get-lesson.dto';
import { ApiArrayResponse, ApiResponse } from '@shared/response';
import { LessonDetailDto, LessonDto } from './dto/lesson.dto';

@Controller('lessons')
@ApiTags('Lessons')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    // createLessonDto may include mediaFileIds and documentFileIds
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiArrayResponse(LessonDto)
  findAll(@Query() query: GetLessonDto) {
    return this.lessonsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse(LessonDetailDto)
  findOne(@Param('id') id: number) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse(LessonDto)
  update(@Param('id') id: number, @Body() updateLessonDto: UpdateLessonDto) {
    // updateLessonDto may include mediaFileIds and documentFileIds
    return this.lessonsService.update(+id, updateLessonDto);
  }

  @Delete(':id')
  @ApiResponse(Boolean)
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }
}
