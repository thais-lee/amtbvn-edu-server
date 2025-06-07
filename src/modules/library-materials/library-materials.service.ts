import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, User } from '@prisma/client';

import { FilesService } from '@modules/files/files.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateLibraryMaterialDto } from './dto/create-library-material.dto';
import { GetLibraryMaterialDto } from './dto/get-library-material.dto';
import { UpdateLibraryMaterialDto } from './dto/update-library-material.dto';

@Injectable()
export class LibraryMaterialsService {
  constructor(
    private readonly filesService: FilesService,
    private readonly prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(LibraryMaterialsService.name);

  async create(
    createLibraryMaterialDto: CreateLibraryMaterialDto,
    userId: number,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    this.logger.log('DTO received:', JSON.stringify(createLibraryMaterialDto));

    // Validate file types
    const allowedMimeTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
    ];

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not supported. Supported types are: PDF, DOC, DOCX, MP4, MPEG, MOV, AVI, WMV, MP3, WAV, OGG, M4A`,
        );
      }
    }

    try {
      // Use transaction to ensure data consistency
      return await this.prisma.$transaction(async (prisma) => {
        // Prepare data for creation
        const data = {
          ...createLibraryMaterialDto,
          categoryId: Number(createLibraryMaterialDto.categoryId),
          tags:
            typeof createLibraryMaterialDto.tags === 'string'
              ? JSON.parse(createLibraryMaterialDto.tags)
              : createLibraryMaterialDto.tags,
        };

        // Create library material
        const libraryMaterial = await prisma.libraryMaterial.create({
          data,
        });

        if (files.some((f) => !f)) {
          this.logger.error('One or more files are undefined!', files);
          throw new BadRequestException(
            'One or more uploaded files are invalid.',
          );
        }

        // Upload files and create file records
        const filePromises = files
          .filter(Boolean)
          .map((file) =>
            this.filesService.uploadFileAndRecord(
              prisma,
              file,
              'library-materials',
              userId,
              createLibraryMaterialDto.description,
              libraryMaterial.id,
            ),
          );

        this.logger.log('libraryMaterial:', libraryMaterial.id);
        this.logger.log('user:', userId);

        await Promise.all(filePromises);

        // Return library material with its files
        return prisma.libraryMaterial.findUnique({
          where: { id: libraryMaterial.id },
          include: {
            files: true,
          },
        });
      });
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create library material',
      );
    }
  }

  async findAll(query: GetLibraryMaterialDto) {
    const { skip = 0, take = 10, search, sort, order, categoryId } = query;

    const where: Prisma.LibraryMaterialWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
      ],
    };

    const [total, items] = await Promise.all([
      this.prisma.libraryMaterial.count({ where }),
      this.prisma.libraryMaterial.findMany({
        where,
        skip,
        take,
        orderBy: sort ? { [sort]: order || 'desc' } : { id: 'desc' },
        include: {
          files: true,
          category: true,
        },
      }),
    ]);

    return { total, items };
  }

  async findOne(id: number) {
    const libraryMaterial = await this.prisma.libraryMaterial.findUnique({
      where: { id: id },
      include: {
        files: true,
        category: true,
      },
    });

    if (!libraryMaterial) {
      throw new NotFoundException(`Library material with ID ${id} not found`);
    }

    return libraryMaterial;
  }

  async update(id: number, updateLibraryMaterialDto: UpdateLibraryMaterialDto) {
    const libraryMaterial = await this.findOne(id);

    return this.prisma.libraryMaterial.update({
      where: { id },
      data: updateLibraryMaterialDto,
      include: {
        files: true,
        category: true,
      },
    });
  }

  async remove(id: number) {
    const libraryMaterial = await this.findOne(id);

    // Delete associated files first
    await this.prisma.file.deleteMany({
      where: {
        libraryMaterialId: id,
      },
    });

    // Then delete the library material
    return this.prisma.libraryMaterial.delete({
      where: { id },
    });
  }

  async removeMany(ids: number[]) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.file.deleteMany({
        where: {
          libraryMaterialId: { in: ids },
        },
      });

      await prisma.libraryMaterial.deleteMany({
        where: { id: { in: ids } },
      });

      return { message: 'Library materials deleted successfully' };
    });
  }
}
