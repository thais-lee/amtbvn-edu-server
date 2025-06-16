import { TConfigs } from '@configs/index';
import { TStorageConfig } from '@configs/storage.config';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MINIO_TOKEN } from '@shared/constants/token.constant';
import * as Minio from 'minio';

@Global()
@Module({
  exports: [MINIO_TOKEN],
  providers: [
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: async (
        configService: ConfigService<TConfigs>,
      ): Promise<Minio.Client> => {
        const storageConfig = configService.get<TStorageConfig>('storage');
        const client = new Minio.Client({
          endPoint: storageConfig.endpoint,
          port: storageConfig.port,
          accessKey: storageConfig.accessKey,
          secretKey: storageConfig.secretKey,
          useSSL: process.env.NODE_ENV === 'production',
          // region: 'us-east-1',
        });

        // Ensure bucket exists
        try {
          const bucketExists = await client.bucketExists(storageConfig.bucketName);
          if (!bucketExists) {
            await client.makeBucket(storageConfig.bucketName);
          }
        } catch (error) {
          console.error('Error checking/creating bucket:', error);
        }

        return client;
      },
    },
  ],
})
export class MinioModule {}