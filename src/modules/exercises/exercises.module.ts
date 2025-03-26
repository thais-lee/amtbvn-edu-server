import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { FilesModule } from '@modules/files/files.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { FilesService } from '@modules/files/files.service';

@Module({
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
  imports: [PrismaModule, JwtModule, FilesModule],
})
export class ExercisesModule {}
