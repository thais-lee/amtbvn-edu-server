import { Injectable, Logger } from '@nestjs/common';

import { Prisma, User } from '@prisma/client';

import { PaginatedData } from '@shared/paginated';

import { PrismaService } from '@src/prisma/prisma.service';
import { FilesService } from '../files/files.service';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteManyUsersDto } from './dto/delete-many-user.dto';
import { AdminGetUsersDto, SearchUsersDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  public async search(input: SearchUsersDto) {
    const where: Prisma.UserWhereInput = {
      OR: [
        {
          firstName: {
            contains: input.search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: input.search,
            mode: 'insensitive',
          },
        },
        {
          userLogin: {
            OR: [
              {
                email: {
                  contains: input.search,
                  mode: 'insensitive',
                },
              },
              {
                username: {
                  contains: input.search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ],
    };

    const total = await this.prisma.user.count({ where });

    const items = await this.prisma.user.findMany({
      where,
      include: {
        userLogin: true,
      },
    });

    return new PaginatedData(total, items);
  }

  public async adminGetPaginated(input: AdminGetUsersDto) {
    const where: Prisma.UserWhereInput = {
      OR: input.search
        ? [
            {
              firstName: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              userLogin: {
                OR: [
                  {
                    email: {
                      contains: input.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    username: {
                      contains: input.search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ]
        : undefined,
      roles: input.roles?.length > 0 ? { hasSome: input.roles } : undefined,
    };

    const total = await this.prisma.user.count({ where: where as any });

    const items = await this.prisma.user.findMany({
      where: where as any,
      skip: input.skip,
      take: input.take,
      include: {
        userLogin: {
          select: {
            username: true,
            email: true,
            isEmailVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new PaginatedData(total, items);
  }

  public async adminGetOne(id: number) {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        userLogin: true,
        sessions: true,
      },
    });
  }

  public async adminCreate(input: CreateUserDto) {
    return await this.prisma.user.create({
      data: input,
      include: {
        userLogin: true,
        sessions: true,
      },
    });
  }

  public async adminUpdate(id: number, input: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: input,
      include: {
        userLogin: true,
        sessions: true,
      },
    });
  }

  public async adminDelete(id: number) {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  public async adminDeleteMany(input: DeleteManyUsersDto) {
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: input.ids,
        },
      },
    });
  }

  public async updateAvatar(file: Express.Multer.File, user: User) {
    if (user.avatarImageFileUrl) {
      try {
        const url = new URL(user.avatarImageFileUrl);
        const storagePath = url.pathname.split('/').slice(2).join('/');
        await this.filesService.remove(storagePath);
      } catch (e) {
        this.logger.warn(`Failed to remove old avatar: ${e.message}`);
      }
    }

    const uploadResult = await this.filesService.uploadImage(file, 'users/avatars');

    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        avatarImageFileUrl: uploadResult.url,
      },
      include: {
        sessions: true,
        userLogin: true,
      },
    });
  }

  public async updateMe(user: User, input: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: input,
      include: {
        sessions: true,
        userLogin: true,
      },
    });
  }
}
