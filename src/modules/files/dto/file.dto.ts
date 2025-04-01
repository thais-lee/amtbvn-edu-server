import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  buffer: Buffer | string;
}

export class Folder {
  name: string;
}

export class FileDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fileName: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  storagePath: string;

  @ApiProperty()
  mimeType: AppMimeType;

  @ApiProperty()
  size: number;

  @ApiProperty()
  uploadedBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type AppMimeType = 'image/png' | 'image/jpeg';