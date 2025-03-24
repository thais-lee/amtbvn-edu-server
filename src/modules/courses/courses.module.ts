import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@src/prisma/prisma.module';

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
  imports: [PrismaModule, JwtModule],
})
export class CoursesModule {}
