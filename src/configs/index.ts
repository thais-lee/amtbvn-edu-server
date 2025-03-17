import { TAppConfig } from './app.config';
import { TAuthConfig } from './auth.config';
import { TRedisConfig } from './redis.config';
import { TStorageConfig } from './storage.config';

export type TConfigs = {
  app: TAppConfig;
  auth: TAuthConfig;
  redis: TRedisConfig;
  storage: TStorageConfig;
};
