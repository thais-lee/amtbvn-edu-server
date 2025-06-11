import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ActivityModule } from '@modules/activities/activity.module';
import { FilesModule } from '@modules/files/files.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
  imports: [JwtModule, PrismaModule, FilesModule, ActivityModule],
})
export class LessonsModule {}
