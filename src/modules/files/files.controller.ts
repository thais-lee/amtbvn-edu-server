import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateFileDto } from './dto/create-file.dto';
import { BufferedFile, Folder } from './dto/file.dto';
import { FilesService } from './files.service';

@Controller('files')
@ApiTags('Files')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('buckets')
  bucketsList() {
    return this.filesService.bucketList();
  }

  @Get('file-url/:name')
  getFile(@Param('name') name: string) {
    return this.filesService.getFile(name);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile('file') file: BufferedFile,
    @Body() folder: Folder,
  ) {
    return this.filesService.uploadImage(file, folder.name);
  }

  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       name: { type: 'string' },
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadfile(
  //   @UploadedFile('file') file: BufferedFile,
  //   @Body() fileInfo: CreateFileDto,
  //   @CurrentUser() user,
  // ) {
  //   return this.filesService.uploadFile(file, fileInfo, user.id);
  // }

  @Post('create-folder')
  @ApiResponse(Boolean)
  @UseInterceptors(TransformResponseInterceptor)
  async createFolder(@Body() folder: Folder): Promise<boolean> {
    return this.filesService.createFilePath(folder.name);
  }
}
