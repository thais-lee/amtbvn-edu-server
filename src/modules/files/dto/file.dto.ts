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
  mimeType: string; // Cho phép mọi loại mimetype

  @ApiProperty()
  size: number;

  @ApiProperty()
  uploadedBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Presigned URL to access the file' })
  accessUrl?: string; // Thêm trường này
}

export type AppMimeType = 'image/png' | 'image/jpeg';