import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteManyCategoriesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];
}
