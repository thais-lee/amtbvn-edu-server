import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as Minio from 'minio';

import { TConfigs } from '@configs/index';
import { TStorageConfig } from '@configs/storage.config';

import { InjectMinio } from '@src/decorators/minio.decorator';

import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  private readonly bucketName: string;

  constructor(
    @InjectMinio() private readonly minioService: Minio.Client,
    private readonly configService: ConfigService<TConfigs>,
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

  public async uploadFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`;
      this.minioService.putObject(
        this.bucketName,
        filename,
        file.buffer,
        file.size,
        (error, objInfo) => {
          if (error) {
            reject(error);
          } else {
            resolve(objInfo);
          }
        },
      );
    });
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
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
