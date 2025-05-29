import { Module } from '@nestjs/common';

import { FilesModule } from '@modules/files/files.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { LibraryMaterialsController } from './library-materials.controller';
import { LibraryMaterialsService } from './library-materials.service';

@Module({
  controllers: [LibraryMaterialsController],
  providers: [LibraryMaterialsService],
  imports: [PrismaModule, FilesModule],
  exports: [LibraryMaterialsService],
})
export class LibraryMaterialsModule {}
