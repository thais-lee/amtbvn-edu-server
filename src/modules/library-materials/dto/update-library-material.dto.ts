import { PartialType } from '@nestjs/swagger';
import { CreateLibraryMaterialDto } from './create-library-material.dto';

export class UpdateLibraryMaterialDto extends PartialType(CreateLibraryMaterialDto) {}
