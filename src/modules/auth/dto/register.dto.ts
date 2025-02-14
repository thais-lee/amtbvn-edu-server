import { EGender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(12)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsEnum(EGender)
  @IsOptional()
  gender?: EGender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;
}
