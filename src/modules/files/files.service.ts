import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as crypto from 'crypto';
import * as Minio from 'minio';

import { TConfigs } from '@configs/index';
import { TStorageConfig } from '@configs/storage.config';

import { InjectMinio } from '@src/decorators/minio.decorator';
import { PrismaService } from '@src/prisma/prisma.service';

import { BufferedFile } from './dto/file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly port: number;

  constructor(
    @InjectMinio() private readonly minioService: Minio.Client,
    private readonly configService: ConfigService<TConfigs>,
    private readonly prisma: PrismaService,
  ) {
    this.endpoint =
      this.configService.getOrThrow<TStorageConfig>('storage').endpoint;
    this.port = this.configService.getOrThrow<TStorageConfig>('storage').port;
    this.bucketName =
      this.configService.getOrThrow<TStorageConfig>('storage').bucketName;
  }

  public async bucketList() {
    return await this.minioService.listBuckets();
  }

  public async getFile(fileName: string) {
    return await this.minioService.presignedUrl(
      'GET',
      this.bucketName,
      fileName,
    );
  }

  public async uploadImage(file: BufferedFile, folder: string = 'images') {
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new HttpException(
        'File type not supported',
        HttpStatus.BAD_REQUEST,
      );
    }
    const timestamp = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(timestamp)
      .digest('hex');
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };
    const fileName = folder
      ? `${folder}/${hashedFileName + extension}`
      : hashedFileName + extension;

    await this.minioService.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData,
    );

    return {
      url: `${this.endpoint}:${this.port}/${this.bucketName}/${fileName}`,
      message: 'File uploaded successfully',
    };
  }

  public async uploadFile(file: Express.Multer.File, folder: string = 'files') {
    try {
      const metaData = {
        'Content-Type': file.mimetype,
      };

      const uploadedFile = await this.minioService.putObject(
        this.bucketName,
        `${folder}/${file.originalname}`,
        file.buffer,
        file.size,
        metaData,
      );

      return {
        filePath: `${this.bucketName}/${folder}/${file.originalname}`,
        etag: uploadedFile.etag,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  public async uploadMultipleFiles(files: BufferedFile[], folder: string = 'files') {
    try {
      const metaData = {
        'Content-Type': files[0].mimetype,
      };

      for (const file of files) {
        await this.minioService.putObject(
          this.bucketName,
          `${folder}/${file.originalname}`,
          file.buffer,
          file.size,
          metaData,
        );
      }
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async createFilePath(filePath: string) {
    await this.minioService.putObject(
      this.bucketName,
      filePath,
      Buffer.from(''),
    );
    return true;
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(filePath: string) {
    return this.minioService.removeObject(this.bucketName, filePath);
  }
}
