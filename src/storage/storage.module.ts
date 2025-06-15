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
        // client.setBucketPolicy(configService.get<TStorageConfig>('storage').bucketName, JSON.stringify({
        //   Version: '2012-10-17',
        //   Statement: [
        //     {
        //       Effect: 'Allow',
        //       Principal: {
        //         AWS: ['*'],
        //       },
        //       Action: [
        //         's3:ListBucketMultipartUploads',
        //         's3:GetBucketLocation',
        //         's3:ListBucket',
        //       ],
        //       Resource: ['arn:aws:s3:::' + configService.get<TStorageConfig>('storage').bucketName], // Change this according to your bucket name
        //     },
        //     {
        //       Effect: 'Allow',
        //       Principal: {
        //         AWS: ['*'],
        //       },
        //       Action: [
        //         's3:PutObject',
        //         's3:AbortMultipartUpload',
        //         's3:DeleteObject',
        //         's3:GetObject',
        //         's3:ListMultipartUploadParts',
        //       ],
        //       Resource: ['arn:aws:s3:::' + configService.get<TStorageConfig>('storage').bucketName + '/*'], // Change this according to your bucket name
        //     },
        //   ],
        // }));
        return client;
      },
    },
  ],
})
export class MinioModule {}