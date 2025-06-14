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
  ) {
    // Validate fileIds
    if (
      !createLibraryMaterialDto.fileIds ||
      createLibraryMaterialDto.fileIds.length === 0
    ) {
      throw new BadRequestException('At least one file is required');
    }
    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (prisma) => {
      const { categoryId, fileIds, ...rest } = createLibraryMaterialDto;
      const data: any = {
        ...rest,
        tags: typeof rest.tags === 'string' ? JSON.parse(rest.tags) : rest.tags,
        category: { connect: { id: Number(categoryId) } },
      };
      delete data.fileIdsToRemove;
      // Create library material
      const libraryMaterial = await prisma.libraryMaterial.create({
        data,
      });
      // Associate files
      await prisma.file.updateMany({
        where: { id: { in: fileIds } },
        data: { libraryMaterialId: libraryMaterial.id },
      });
      // Return with files
      return prisma.libraryMaterial.findUnique({
        where: { id: libraryMaterial.id },
        include: { files: true, category: true },
      });
    });
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

  async update(
    id: number,
    updateLibraryMaterialDto: UpdateLibraryMaterialDto,
    userId: number,
  ) {
    const libraryMaterial = await this.findOne(id);
    // Remove files if requested
    if (
      updateLibraryMaterialDto.fileIdsToRemove &&
      updateLibraryMaterialDto.fileIdsToRemove.length > 0
    ) {
      // Get file records for storage path
      const filesToRemove = await this.prisma.file.findMany({
        where: { id: { in: updateLibraryMaterialDto.fileIdsToRemove } },
      });
      // Delete from storage
      for (const file of filesToRemove) {
        try {
          await this.filesService.deleteFile(file.id);
        } catch (e) {
          this.logger.warn(
            `Failed to remove file from storage: ${file.storagePath}`,
          );
        }
      }
    }
    // Update metadata
    const { fileIdsToRemove, categoryId, fileIds, ...updateData } =
      updateLibraryMaterialDto;
    // Start a transaction to ensure data consistency
    return this.prisma.$transaction(async (prisma) => {
      // Update the library material metadata
      const updatedMaterial = await prisma.libraryMaterial.update({
        where: { id },
        data: {
          ...updateData,
          category: categoryId
            ? {
                connect: { id: categoryId },
              }
            : undefined,
        },
        include: {
          files: true,
          category: true,
        },
      });
      // Associate new files if provided
      if (fileIds && fileIds.length > 0) {
        await prisma.file.updateMany({
          where: { id: { in: fileIds } },
          data: { libraryMaterialId: id },
        });
      }
      // Return the final updated material with all files
      return prisma.libraryMaterial.findUnique({
        where: { id },
        include: {
          files: true,
          category: true,
        },
      });
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

  async getFileDownloadUrl(materialId: number, fileId: number) {
    // Ensure the file belongs to the material
    const material = await this.findOne(materialId);
    const file = material.files.find((f) => f.id === fileId);
    if (!file) {
      throw new NotFoundException('File not found in this material');
    }
    // Extract storage path relative to bucket
    let storagePath = file.storagePath;
    const bucketIndex = storagePath.indexOf(
      process.env.MINIO_DEFAULT_BUCKET + '/',
    );
    if (bucketIndex !== -1) {
      storagePath = storagePath.substring(
        bucketIndex + process.env.MINIO_DEFAULT_BUCKET.length + 1,
      );
    }
    const url = await this.filesService.getPresignedUrl(storagePath);
    return { url };
  }
}
