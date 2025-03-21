import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as Minio from 'minio';

import { TConfigs } from '@configs/index';
import { TStorageConfig } from '@configs/storage.config';

import { InjectMinio } from '@src/decorators/minio.decorator';

import { UpdateFileDto } from './dto/update-file.dto';
import { BufferedFile } from './dto/file.dto';
import * as crypto from 'crypto';
import { PrismaService } from '@src/prisma/prisma.service';


@Injectable()
export class FilesService {
  private readonly bucketName: string;

  constructor(
    @InjectMinio() private readonly minioService: Minio.Client,
    private readonly configService: ConfigService<TConfigs>,
    private readonly prismaService: PrismaService
  ) {
    this.bucketName =
      this.configService.getOrThrow<TStorageConfig>('storage').bucketName;
  }

  public async bucketList() {
    return await this.minioService.listBuckets();
  }

  public async getFile(fileName: string) {
    return await this.minioService.presignedUrl('GET', this.bucketName, fileName);
  }

  public async uploadFile(file: BufferedFile, folder: string) {
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
    const fileName = folder ? `${folder}/${hashedFileName + extension}` : hashedFileName + extension;

    await this.minioService.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData,
    );

    this.prismaService.file

    return {
      url: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.bucketName}/${fileName}`,
      message: 'File uploaded successfully',
    };
  }

  async createFilePath(filePath: string) {
    await this.minioService.putObject(this.bucketName, filePath, Buffer.from(''))
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

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
