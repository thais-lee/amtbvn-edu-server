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
      // Normalize file name to NFC
      const normalizedFileName = file.originalname.normalize('NFC');
      const metaData = {
        'Content-Type': file.mimetype,
      };

      const uploadedFile = await this.minioService.putObject(
        this.bucketName,
        `${folder}/${normalizedFileName}`,
        file.buffer,
        file.size,
        metaData,
      );

      let endpointWithProtocol = this.endpoint;
      if (!/^https?:\/\//.test(endpointWithProtocol)) {
        endpointWithProtocol = 'http://' + endpointWithProtocol;
      }

      return {
        filePath: `${endpointWithProtocol}:${this.port}/${this.bucketName}/${folder}/${normalizedFileName}`,
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
    console.log(file.originalname);
    console.log(file.filename);
    
    // Trả về File object từ Prisma
    try {
      // Normalize file name to NFC
      const normalizedFileName = file.originalname.normalize('NFC');
      const timestamp = Date.now().toString();
      const hashedFileName = crypto
        .createHash('md5')
        .update(timestamp + normalizedFileName) // Thêm originalname để tăng tính duy nhất
        .digest('hex');

      const extension = normalizedFileName.substring(
        normalizedFileName.lastIndexOf('.'),
        normalizedFileName.length,
      );

      let endpointWithProtocol = this.endpoint;
      if (!/^https?:\/\//.test(endpointWithProtocol)) {
        endpointWithProtocol = 'http://' + endpointWithProtocol;
      }

      const storagePath = `${folder}/${hashedFileName}`;
      const fileUrl = `${endpointWithProtocol}:${this.port}/${this.bucketName}/${storagePath}`;
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
          fileName: normalizedFileName, // Lưu tên gốc đã normalize
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
    const expiryInSeconds = 60 * 60;
    try {
      // Extract the relative path from the full URL
      let relativePath = storagePath;
      
      // Remove protocol and host
      const bucketIndex = storagePath.indexOf(this.bucketName + '/');
      if (bucketIndex !== -1) {
        relativePath = storagePath.substring(bucketIndex + this.bucketName.length + 1);
      }

      this.logger.log(`Getting presigned URL for relative path: ${relativePath}`);
      
      const url = await this.minioService.presignedGetObject(
        this.bucketName,
        relativePath,
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

  async deleteFile(id: number) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Extract the storage path relative to the bucket
    // Example: http://localhost:9000/main/files/abc.jpg -> files/abc.jpg
    let storagePath = file.storagePath;
    // Remove protocol and host
    const bucketIndex = storagePath.indexOf(this.bucketName + '/');
    if (bucketIndex !== -1) {
      storagePath = storagePath.substring(bucketIndex + this.bucketName.length + 1);
    }

    // Delete from MinIO
    try {
      await this.minioService.removeObject(
        this.bucketName,
        storagePath,
      );
    } catch (error) {
      this.logger.error(`Failed to delete file from MinIO: ${error.stack}`);
      throw new BadRequestException('MinIO: Failed to delete file');
    }

    // Delete from database
    await this.prisma.file.delete({
      where: { id },
    });
  }
}
