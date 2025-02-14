import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { EGender, User } from '@prisma/client';

import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CHttpException } from '@shared/custom-http-exception';
import { compareHash, generateHash } from '@shared/helpers/string.helper';

import { PrismaService } from '@src/prisma/prisma.service';

import { RegisterInputDto } from './dto/register.dto';
import { TokenAuthInputDto, TokenAuthResponseDto } from './dto/token-auth.dto';

@Injectable()
export class AuthService {
  private readonly accessTokenExpireIn: number;
  private readonly refreshTokenExpireIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TConfigs>,
    private readonly prisma: PrismaService,
  ) {
    this.accessTokenExpireIn =
      this.configService.getOrThrow<TAuthConfig>('auth').accessTokenExpireIn;
    this.refreshTokenExpireIn =
      this.configService.getOrThrow<TAuthConfig>('auth').refreshTokenExpireIn;
  }

  async getMe(userId: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sessions: true,
        userLogin: true,
      },
    });
  }

  async getJwtTokenUsingUser(user: User) {
    const accessToken = this.generateJwtToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.accessTokenExpireIn,
      refreshTokenExpiresIn: this.refreshTokenExpireIn,
    };
  }

  async register(registerDto: RegisterInputDto): Promise<boolean> {
    const userLogin = await this.prisma.userLogin.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
      },
    });

    if (userLogin) {
      throw new CHttpException(
        AuthService.name,
        HttpStatus.CONFLICT,
        'Username or Email already exists',
        ApiResponseCode.USER_ALREADY_EXISTS,
      );
    }

    const passwordHash = await generateHash(registerDto.password);

    await this.prisma.user.create({
      data: {
        userLogin: {
          create: {
            email: registerDto.email,
            username: registerDto.username,
            password: passwordHash,
          },
        },
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        gender: registerDto.gender,
        dateOfBirth: registerDto.dateOfBirth,
        roles: ['USER'],
      },
      include: {
        userLogin: true,
      },
    });

    return true;
  }

  async tokenAuth(input: TokenAuthInputDto): Promise<TokenAuthResponseDto> {
    const userLogin = await this.prisma.userLogin.findFirst({
      where: {
        OR: [
          { email: input.usernameOrEmail },
          { username: input.usernameOrEmail },
        ],
      },
    });

    if (!userLogin) {
      throw new CHttpException(
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
        'Username or Email not found',
        ApiResponseCode.USER_NOT_FOUND,
      );
    }

    const isPasswordValid = await compareHash(
      input.password,
      userLogin.password,
    );

    if (!isPasswordValid) {
      throw new CHttpException(
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
        'Wrong password',
        ApiResponseCode.WRONG_PASSWORD,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userLogin.userId,
      },
      include: {
        userLogin: true,
        sessions: true,
      },
    });

    return this.getJwtTokenUsingUser(user);
  }

  private generateJwtToken(user: User) {
    return this.jwtService.sign({ user });
  }

  private generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      { id: userId },
      {
        expiresIn: this.refreshTokenExpireIn,
      },
    );
  }
}
