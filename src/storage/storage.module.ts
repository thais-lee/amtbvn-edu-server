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
        const client = new Minio.Client({
          endPoint: configService.get<TStorageConfig>('storage').endpoint,
          port: configService.get<TStorageConfig>('storage').port,
          accessKey: configService.get<TStorageConfig>('storage').accessKey,
          secretKey: configService.get<TStorageConfig>('storage').secretKey,
          useSSL: false,
        });
        return client;
      },
    },
  ],
})
export class MinioModule {}