import { TAppConfig } from './app.config';
import { TAuthConfig } from './auth.config';
import { TRedisConfig } from './redis.config';

export type TConfigs = {
  app: TAppConfig;
  auth: TAuthConfig;
  redis: TRedisConfig;
};
