import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteManyLibraryMaterialDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  @Transform(({ value }) => value.map((id) => Number(id)))
  ids: number[];
}
