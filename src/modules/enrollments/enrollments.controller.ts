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

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentDetailDto, EnrollmentDto } from './dto/enrollment.dto';
import { GetEnrollmentDto } from './dto/get-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
@ApiTags('Enrollments')
@JwtAuth()
@ApiBearerAuth()
@UseInterceptors(TransformResponseInterceptor)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiResponse(EnrollmentDto)
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @ApiArrayResponse(EnrollmentDto)
  findAll(@Query() query: GetEnrollmentDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Patch('update')
  @ApiResponse(EnrollmentDto)
  update(
    @Param() params: GetEnrollmentDto,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(params.userId, params.courseId, updateEnrollmentDto);
  }

  @Delete('delete')
  remove(@Param() params: GetEnrollmentDto) {
    return this.enrollmentsService.remove(params.userId, params.courseId);
  }
}
