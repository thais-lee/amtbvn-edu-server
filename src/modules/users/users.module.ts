import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '@modules/files/files.module';
import { FilesService } from '@modules/files/files.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FilesService],
  exports: [UsersService],
  imports: [PrismaModule, JwtModule, FilesModule],
})
export class UsersModule {}
