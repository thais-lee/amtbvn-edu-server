import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { FilesModule } from '@modules/files/files.module';
import { FilesService } from '@modules/files/files.service';

import { PrismaModule } from '@src/prisma/prisma.module';

import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
  imports: [PrismaModule, JwtModule, FilesModule],
})
export class ArticlesModule {}
