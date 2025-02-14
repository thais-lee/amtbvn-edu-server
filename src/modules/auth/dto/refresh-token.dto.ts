import { IsInt, IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @IsJWT()
  accessToken: string;

  @IsInt()
  accessTokenExpiresIn: number;
}
