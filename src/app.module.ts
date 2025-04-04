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
import { CategoriesModule } from './modules/categories/categories.module';
import { MinioModule } from './storage/storage.module';
import { FilesModule } from './modules/files/files.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ActivityModule } from './modules/activities/activity.module';
import storageConfig from '@configs/storage.config';
import { ArticlesModule } from '@modules/articles/articles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, redisConfig, storageConfig],
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
    CategoriesModule,
    MinioModule,
    FilesModule,
    CoursesModule,
    EnrollmentsModule,
    LessonsModule,
    ActivityModule,
    ArticlesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
