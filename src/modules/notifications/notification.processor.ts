import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FirebaseService } from '@src/shared/services/firebase.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

export interface SendNotificationJob {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  @Process('send')
  async handleSendNotification(job: Job<SendNotificationJob>) {
    const { notificationId, userId, title, message, data } = job.data;

    try {
      // 1. Get user's active devices
      const userDevices = await this.prisma.userDevice.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (userDevices.length === 0) {
        this.logger.log(`No active devices found for user ${userId}`);
        return;
      }

      // 2. Send push notification
      const tokens = userDevices.map(device => device.fcmToken);
      const response = await this.firebaseService.sendNotification(
        tokens,
        { title, body: message },
        data as Record<string, string>,
      );

      // 3. Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => (!resp.success ? tokens[idx] : null))
          .filter(Boolean);

        // Deactivate failed tokens
        if (failedTokens.length > 0) {
          await this.prisma.userDevice.updateMany({
            where: {
              fcmToken: {
                in: failedTokens,
              },
            },
            data: {
              isActive: false,
            },
          });
        }
      }

      // 4. Update notification status
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          sentAt: new Date(),
          sendStatus: 'SENT',
          sendError: null,
        },
      });

    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notificationId}:`,
        error.stack,
      );

      // Update notification with error
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          sendStatus: 'FAILED',
          sendError: error.message,
          retryCount: {
            increment: 1,
          },
        },
      });

      // Retry if less than 3 attempts
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (notification.retryCount < 3) {
        throw error; // Bull will retry the job
      }
    }
  }
} 