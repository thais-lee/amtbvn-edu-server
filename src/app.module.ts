import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

import { RedisModule } from '@nestjs-modules/ioredis';

import appConfig from '@configs/app.config';
import authConfig from '@configs/auth.config';
import redisConfig, { TRedisConfig } from '@configs/redis.config';

import { TConfigs } from './configs';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, redisConfig],
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    // RedisModule.forRootAsync({
    //   useFactory: (configService: ConfigService<TConfigs>) => ({
    //     type: 'single',
    //     url: configService.get<TRedisConfig>('redis').url,
    //   }),
    //   inject: [ConfigService],
    // }),
    PrismaModule,
    ScheduleModule.forRoot(),
    TerminusModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
