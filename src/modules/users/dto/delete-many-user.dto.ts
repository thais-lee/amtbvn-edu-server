import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteManyUsersDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];
}
