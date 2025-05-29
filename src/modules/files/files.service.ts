import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

import { TConfigs } from '@configs/index';
import { TStorageConfig } from '@configs/storage.config';

import { InjectMinio } from '@src/decorators/minio.decorator';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class FilesService {
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly logger = new Logger(FilesService.name);

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

  public async getFileById(id: number) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  public async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images',
  ) {
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

    // Ensure endpoint includes protocol
    let endpointWithProtocol = this.endpoint;
    if (!/^https?:\/\//.test(endpointWithProtocol)) {
      endpointWithProtocol = 'http://' + endpointWithProtocol;
    }

    await this.minioService.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData,
    );

    return {
      url: `${endpointWithProtocol}:${this.port}/${this.bucketName}/${fileName}`,
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

      let endpointWithProtocol = this.endpoint;
      if (!/^https?:\/\//.test(endpointWithProtocol)) {
        endpointWithProtocol = 'http://' + endpointWithProtocol;
      }

      return {
        filePath: `${endpointWithProtocol}:${this.port}/${this.bucketName}/${folder}/${file.originalname}`,
        etag: uploadedFile.etag,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  public async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'files',
  ) {
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

  /**
   * Uploads a file to Minio, creates a File record in the database,
   * and returns the created File record.
   */
  public async uploadFileAndRecord(
    prisma: PrismaService | Prisma.TransactionClient,
    file: Express.Multer.File, // Sử dụng BufferedFile hoặc Express.Multer.File tùy theo interceptor
    folder: string = 'files',
    userId: number,
    description?: string,
    libraryMaterialId?: number,
  ): Promise<Prisma.FileGetPayload<{}>> {
    // Debug log for all arguments
    this.logger.log('uploadFileAndRecord args:', {
      file: file ? file.originalname : file,
      folder,
      userId,
      description,
      libraryMaterialId,
    });
    // Trả về File object từ Prisma
    try {
      const timestamp = Date.now().toString();
      const hashedFileName = crypto
        .createHash('md5')
        .update(timestamp + file.originalname) // Thêm originalname để tăng tính duy nhất
        .digest('hex');

      const extension = file.originalname.substring(
        file.originalname.lastIndexOf('.'),
        file.originalname.length,
      );

      let endpointWithProtocol = this.endpoint;
      if (!/^https?:\/\//.test(endpointWithProtocol)) {
        endpointWithProtocol = 'http://' + endpointWithProtocol;
      }

      const storagePath = `${folder}/${hashedFileName}`;
      const fileUrl = `${endpointWithProtocol}:${this.port}/${this.bucketName}/${storagePath}${extension}`;
      const metaData = {
        'Content-Type': file.mimetype,
      };

      // 1. Upload to Minio
      await this.minioService.putObject(
        this.bucketName,
        storagePath,
        file.buffer,
        file.size,
        metaData,
      );
      this.logger.log(`File uploaded to Minio: ${storagePath}`);

      // 2. Create File record in Database
      const fileRecord = await prisma.file.create({
        data: {
          fileName: file.originalname, // Lưu tên gốc
          storagePath: fileUrl, // Lưu đường dẫn trên Minio
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: userId,
          description: description, // Thêm description nếu có
          libraryMaterialId: libraryMaterialId ?? undefined,
        },
      });
      this.logger.log(`File record created in DB: ID ${fileRecord.id}`);

      return fileRecord; // Trả về bản ghi File đã tạo
    } catch (error) {
      this.logger.error(`Failed to upload file and record: ${error.stack}`);
      // Cân nhắc xóa file khỏi Minio nếu tạo record DB thất bại (rollback)
      // await this.remove(storagePath).catch(e => this.logger.error(`Rollback failed: ${e.stack}`));
      throw new BadRequestException('Failed to upload file');
    }
  }

  public async uploadFileAndRecordNoTx(
    file: Express.Multer.File,
    folder: string = 'files',
    userId: number,
    description?: string,
    libraryMaterialId?: number,
  ) {
    return this.uploadFileAndRecord(
      this.prisma,
      file,
      folder,
      userId,
      description,
      libraryMaterialId,
    );
  }

  public async uploadFileAndRecordMultiple(
    files: Express.Multer.File[],
    folder: string = 'files',
    userId: number,
    description?: string,
  ) {
    for (const file of files) {
      await this.uploadFileAndRecord(
        this.prisma,
        file,
        folder,
        userId,
        description,
      );
    }
    return;
  }

  /**
   * Generates a presigned URL for accessing a file.
   * Note: Ensure bucket policy allows GetObject.
   */
  public async getPresignedUrl(storagePath: string): Promise<string> {
    // Thời gian hết hạn URL (ví dụ: 1 giờ)
    const expiryInSeconds = 60 * 60;
    try {
      const url = await this.minioService.presignedGetObject(
        this.bucketName,
        storagePath,
        expiryInSeconds,
      );
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to get presigned URL for ${storagePath}: ${error.stack}`,
      );
      throw new Error('Could not generate file URL');
    }
  }

  public async getPresignedUrlById(id: number): Promise<string> {
    const file = await this.getFileById(id);
    return this.getPresignedUrl(file.storagePath);
  }

  remove(filePath: string) {
    return this.minioService.removeObject(this.bucketName, filePath);
  }
}
