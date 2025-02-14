import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { PrismaModule } from '@src/prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<TConfigs>) => ({
        secret: configService.get<TAuthConfig>('auth').jwtSecretKey,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: configService.get<TAuthConfig>('auth').accessTokenExpireIn,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthModule, PassportModule, JwtModule],
})
export class AuthModule {}
