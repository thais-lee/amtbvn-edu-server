import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateLibraryMaterialDto } from './dto/create-library-material.dto';
import { DeleteManyLibraryMaterialDto } from './dto/delete-many-library-material';
import { GetLibraryMaterialDto } from './dto/get-library-material.dto';
import { LibraryMaterialDto } from './dto/library-material.dto';
import { UpdateLibraryMaterialDto } from './dto/update-library-material.dto';
import { LibraryMaterialsService } from './library-materials.service';
import { FilesService } from '@modules/files/files.service';

@Controller('library-materials')
@ApiBearerAuth()
@JwtAuth()
@ApiTags('Library Materials')
@UseInterceptors(TransformResponseInterceptor)
export class LibraryMaterialsController {
  constructor(
    private readonly libraryMaterialsService: LibraryMaterialsService,
    private readonly filesService: FilesService,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateLibraryMaterialDto })
  async create(
    @Body() createLibraryMaterialDto: CreateLibraryMaterialDto,
    @CurrentUser() user: User,
  ) {
    return this.libraryMaterialsService.create(
      createLibraryMaterialDto,
      user.id,
    );
  }

  @Get()
  @ApiArrayResponse(LibraryMaterialDto)
  findAll(@Query() query: GetLibraryMaterialDto) {
    return this.libraryMaterialsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryMaterialsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateLibraryMaterialDto })
  update(
    @Param('id') id: string,
    @Body() updateLibraryMaterialDto: UpdateLibraryMaterialDto,
    @CurrentUser() user: User,
  ) {
    return this.libraryMaterialsService.update(
      +id,
      updateLibraryMaterialDto,
      user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryMaterialsService.remove(+id);
  }

  @Delete('delete-many')
  deleteMany(@Body() input: DeleteManyLibraryMaterialDto) {
    return this.libraryMaterialsService.removeMany(input.ids);
  }

  @Get(':materialId/files/:fileId/download')
  async downloadFile(
    @Param('materialId') materialId: string,
    @Param('fileId') fileId: string,
  ) {
    return this.libraryMaterialsService.getFileDownloadUrl(+materialId, +fileId);
  }
}
