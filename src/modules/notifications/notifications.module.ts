import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationProcessor } from './notification.processor';
import { FirebaseService } from '@src/shared/services/firebase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    BullModule.registerQueueAsync({
      name: 'notifications',
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationProcessor,
    FirebaseService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {} 