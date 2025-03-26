import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaModule } from '@src/prisma/prisma.module';
import { MinioModule } from '@src/storage/storage.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [MinioModule, PrismaModule],
  exports: [FilesService],
})
export class FilesModule {}
