import { registerAs } from '@nestjs/config';

import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import validateConfig from '@shared/validator-config';

export type TAuthConfig = {
  jwtSecretKey: string;
  accessTokenExpireIn: number;
  refreshTokenExpireIn: number;

  facebookAppId: string;
  facebookAppSecretKey: string;

  googleAppId: string;
  googleAppSecretKey: string;

  githubAppId: string;
  githubAppSecretKey: string;
};

class AuthConfigValidator {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET_KEY: string;

  @IsInt()
  @IsOptional()
  ACCESS_TOKEN_EXPIRE_IN?: number;

  @IsInt()
  @IsOptional()
  REFRESH_TOKEN_EXPIRE_IN?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  FACEBOOK_APP_ID: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  FACEBOOK_APP_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  GOOGLE_APP_ID: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  GOOGLE_APP_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  GITHUB_APP_ID: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  GITHUB_APP_SECRET_KEY: string;
}

export default registerAs<TAuthConfig>('auth', () => {
  validateConfig(process.env, AuthConfigValidator);

  return {
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    accessTokenExpireIn: parseInt(process.env.ACCESS_TOKEN_EXPIRE_IN) || 3600,
    refreshTokenExpireIn:
      parseInt(process.env.REFRESH_TOKEN_EXPIRE_IN) || 2592000,

    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookAppSecretKey: process.env.FACEBOOK_APP_SECRET_KEY,

    googleAppId: process.env.GOOGLE_APP_ID,
    googleAppSecretKey: process.env.GOOGLE_APP_SECRET_KEY,

    githubAppId: process.env.GITHUB_APP_ID,
    githubAppSecretKey: process.env.GITHUB_APP_SECRET_KEY,
  };
});
