import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MinioModule } from '@src/storage/storage.module';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [MinioModule, PrismaModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
