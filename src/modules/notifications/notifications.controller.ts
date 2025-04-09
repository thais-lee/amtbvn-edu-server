import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { NotificationStatus } from '@prisma/client';
import { CurrentUser } from '@src/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('notifications')
@ApiTags('Notifications')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @CurrentUser() user: User,
    @Query('status') status?: NotificationStatus,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.notificationsService.getUserNotifications(
      user.id,
      status,
      skip,
      take,
    );
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.markAsRead(parseInt(id), user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Post('devices')
  async registerDevice(
    @CurrentUser() user: User,
    @Body('fcmToken') fcmToken: string,
    @Body('deviceId') deviceId?: string,
    @Body('platform') platform?: string,
  ) {
    return this.notificationsService.registerDevice(
      user.id,
      fcmToken,
      deviceId,
      platform,
    );
  }

  @Post('devices/unregister')
  async unregisterDevice(@Body('fcmToken') fcmToken: string) {
    return this.notificationsService.unregisterDevice(fcmToken);
  }
} 