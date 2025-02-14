import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ERole, User } from '@prisma/client';

import { ApiResponse, TransformResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { AuthService } from './auth.service';
import { RegisterInputDto } from './dto/register.dto';
import { TokenAuthInputDto, TokenAuthResponseDto } from './dto/token-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/token-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(TokenAuthResponseDto)
  @UseInterceptors(TransformResponseInterceptor)
  async tokenAuth(
    @Body() input: TokenAuthInputDto,
  ): Promise<TokenAuthResponseDto> {
    return this.authService.tokenAuth(input);
  }

  @Post('/register')
  @ApiResponse(Boolean)
  @UseInterceptors(TransformResponseInterceptor)
  async register(@Body() registerDto: RegisterInputDto): Promise<boolean> {
    return this.authService.register(registerDto);
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiResponse(Boolean)
  @JwtAuth()
  @UseInterceptors(TransformResponseInterceptor)
  async me(@CurrentUser() currentUser: User) {
    return this.authService.getMe(currentUser.id);
  }

  @Get('/admin')
  @ApiBearerAuth()
  @RolesAuth([ERole.ADMIN])
  @JwtAuth()
  @UseInterceptors(TransformResponseInterceptor)
  async admin() {
    return TransformResponse.ok({
      data: { message: 'Admin route for testing' },
    });
  }
}
