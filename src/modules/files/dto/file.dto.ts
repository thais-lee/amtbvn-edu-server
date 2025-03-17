import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({
    description: 'Image Datas',
    format: 'binary',
  })
  images: Express.Multer.File[];
}
