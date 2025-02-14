import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CUnauthorizedException } from '@shared/custom-http-exception';
import { TJwtPayload } from '@shared/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<TConfigs>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<TAuthConfig>('auth').jwtSecretKey,
    });
  }

  async validate(payload: TJwtPayload) {
    const { user } = payload;

    if (!user) {
      throw new CUnauthorizedException(
        JwtStrategy.name,
        'Unauthorized',
        ApiResponseCode.UNAUTHORIZED,
      );
    }

    return user;
  }
}
