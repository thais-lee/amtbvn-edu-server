import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { FilesModule } from '@modules/files/files.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { FilesService } from '@modules/files/files.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
  imports: [PrismaModule, JwtModule, FilesModule],
})
export class ActivityModule {}
