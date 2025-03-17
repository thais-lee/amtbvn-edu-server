import { registerAs } from '@nestjs/config';
import validateConfig from '@shared/validator-config';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export type TStorageConfig = {
  accessKey: string;
  secretKey: string;
  bucketName: string;
  endpoint: string;
  port: number;
};

class StorageConfigValidator {
  @IsString()
  @IsNotEmpty()
  MINIO_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  MINIO_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  MINIO_DEFAULT_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  MINIO_ENDPOINT: string;

  @IsInt()
  @IsNotEmpty()
  MINIO_PORT: number;
}

export default registerAs<TStorageConfig>('storage', () => {
  validateConfig(process.env, StorageConfigValidator);

  return {
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_DEFAULT_BUCKET,
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
  };
});
