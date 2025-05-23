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

import { ApiPaginatedResponse, ApiResponse } from '@shared/response';

import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DeleteManyCategoriesDto } from './dto/delete-many-category.dto';
import { GetCategoryDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@ApiTags('Categories')
@JwtAuth()
@ApiBearerAuth()
@UseInterceptors(TransformResponseInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('admin-create')
  @RolesAuth(['ADMIN'])
  @ApiResponse(CategoryDto)
  async create(@Body() input: CreateCategoryDto) {
    return this.categoriesService.create(input);
  }

  @Get('all')
  @ApiPaginatedResponse(CategoryDto)
  findAll(@Query() query: GetCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiResponse(CategoryDto)
  findOne(@Param('id') id: number) {
    return this.categoriesService.findOne(+id);
  }

  @Get('by-slug/:slug')
  @ApiResponse(CategoryDto)
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id/path')
  @ApiResponse(Array<CategoryDto>)
  getCategoryPath(@Param('id') id: number) {
    return this.categoriesService.getCategoryPath(+id);
  }

  @Get('by-slug/:slug/path')
  @ApiResponse(Array<CategoryDto>)
  getCategoryPathBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryPathBySlug(slug);
  }

  @Patch('admin-update/:id')
  @RolesAuth(['ADMIN'])
  update(@Param('id') id: number, @Body() input: UpdateCategoryDto) {
    return this.categoriesService.update(+id, input);
  }

  @Delete('admin-delete/:id')
  @RolesAuth(['ADMIN'])
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(+id);
  }

  @Delete('admin-delete-many')
  @RolesAuth(['ADMIN'])
  removeMany(@Body() input: DeleteManyCategoriesDto) {
    return this.categoriesService.removeMany(input);
  }
}
