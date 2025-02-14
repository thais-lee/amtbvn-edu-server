import { IsInt, IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class TokenAuthInputDto {
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TokenAuthResponseDto {
  @IsJWT()
  accessToken: string;

  @IsInt()
  accessTokenExpiresIn: number;

  @IsString()
  refreshToken: string;

  @IsInt()
  refreshTokenExpiresIn: number;
}
