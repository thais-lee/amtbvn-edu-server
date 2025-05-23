import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
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

import { BufferedFile, FileDto, Folder } from './dto/file.dto';
import { FilesService } from './files.service';
import { UserBasicDto } from '@modules/users/dto/user.dto';

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
    @UploadedFile('file') file: Express.Multer.File,
    @Body() folder: Folder,
  ) {
    return this.filesService.uploadImage(file, folder.name);
  }

  @Post('upload-record')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        folder: {
          type: 'string',
          description: 'Optional subfolder in the bucket (e.g., articles, avatars)',
          default: 'files',
        },
        description: {
          type: 'string',
          description: 'Optional file description',
        }
      },
      required: ['file'],
    },
  })
  
  @UseInterceptors(FileInterceptor('file')) // Sử dụng interceptor để xử lý file upload field 'file'
  @ApiResponse(FileDto) // Định nghĩa kiểu dữ liệu trả về trong Swagger
  async uploadAndRecordFile(
    @UploadedFile() file: Express.Multer.File, // Lấy file đã upload
    @CurrentUser() user: UserBasicDto,          // Lấy thông tin user đang đăng nhập
    @Body('folder') folder?: string,    // Lấy folder từ body (optional)
    @Body('description') description?: string, // Lấy description từ body (optional)
  ): Promise<FileDto> { // Trả về FileDto
    const createdFile = await this.filesService.uploadFileAndRecord(
      file,
      folder || 'files', // Sử dụng folder hoặc mặc định là 'files'
      user.id,
      description,
    );

    // Lấy presigned URL để truy cập file (nếu cần trả về URL)
    const accessUrl = await this.filesService.getPresignedUrl(createdFile.storagePath);

    // Map dữ liệu từ Prisma model sang DTO để trả về response
    // Thêm URL vào DTO nếu cần
    const fileResponse: FileDto = {
        id: createdFile.id,
        fileName: createdFile.fileName,
        description: createdFile.description,
        storagePath: createdFile.storagePath,
        mimeType: createdFile.mimeType,
        size: createdFile.size,
        uploadedBy: createdFile.uploadedBy,
        createdAt: createdFile.createdAt,
        updatedAt: createdFile.updatedAt,
        accessUrl: accessUrl, // Thêm URL truy cập
    };
    return fileResponse;
  }

  // Endpoint để lấy presigned URL (có thể giữ lại hoặc không tùy nhu cầu)
  @Get('file-url/:id')
  @ApiResponse(String) // Trả về chuỗi URL
  async getPresignedFileUrl(@Param('id', ParseIntPipe) id: number): Promise<{ url: string }> {
    const url = await this.filesService.getPresignedUrlById(id);
    return { url };
  }

}
