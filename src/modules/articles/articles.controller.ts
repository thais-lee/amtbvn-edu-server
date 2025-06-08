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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ERole, User } from '@prisma/client';

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { FilesService } from '@modules/files/files.service';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { PrismaService } from '@src/prisma/prisma.service';

import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/article.dto';
import { GetArticlesDto } from './dto/article.dto';
import { UpdateArticleDto } from './dto/article.dto';
import { DeleteManyArticleDto } from './dto/delete-many-article';

@Controller('articles')
@ApiTags('Articles')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly fileService: FilesService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post()
  @ApiResponse(ArticleDto)
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: User,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    let thumbnailUrl: string | undefined;
    if (thumbnail) {
      thumbnailUrl = (await this.fileService.uploadFile(thumbnail)).filePath;
    }
    createArticleDto.thumbnailUrl = thumbnailUrl;
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  @ApiArrayResponse(ArticleDto)
  findAll(@Query() query: GetArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiResponse(ArticleDto)
  findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.articlesService.findOne(+id, user.roles);
  }

  @Patch(':id')
  @ApiResponse(ArticleDto)
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete('admin/delete/:id')
  @ApiResponse(Boolean)
  @RolesAuth([ERole.ADMIN, ERole.TEACHER])
  remove(@Param('id') id: number) {
    return this.articlesService.deleteOne(id);
  }

  @Delete('admin/delete-many')
  @ApiResponse(Boolean)
  @RolesAuth([ERole.ADMIN])
  deleteMany(@Body() input: DeleteManyArticleDto) {
    return this.articlesService.deleteMany(input);
  }

  @Post(':id/like')
  @ApiResponse(ArticleDto)
  likeArticle(@Param('id') id: number) {
    return this.articlesService.likeArticle(id);
  }
}
