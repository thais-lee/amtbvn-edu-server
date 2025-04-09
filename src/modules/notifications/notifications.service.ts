import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationType, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async createAndSendNotification({
    userId,
    type,
    title,
    message,
    data = {},
    courseId,
  }: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    courseId?: number;
  }) {
    // 1. Create notification in database
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
        courseId,
      },
    });

    // 2. Add notification to queue
    await this.notificationsQueue.add(
      'send',
      {
        notificationId: notification.id,
        userId,
        title,
        message,
        data,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return notification;
  }

  async getUserNotifications(
    userId: number,
    status?: NotificationStatus,
    skip = 0,
    take = 20,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: NotificationStatus.READ,
      },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
      },
    });
  }

  async registerDevice(
    userId: number,
    fcmToken: string,
    deviceId?: string,
    platform?: string,
  ) {
    return this.prisma.userDevice.upsert({
      where: {
        fcmToken,
      },
      update: {
        userId,
        deviceId,
        platform,
        isActive: true,
      },
      create: {
        userId,
        fcmToken,
        deviceId,
        platform,
      },
    });
  }

  async unregisterDevice(fcmToken: string) {
    return this.prisma.userDevice.update({
      where: {
        fcmToken,
      },
      data: {
        isActive: false,
      },
    });
  }
} 