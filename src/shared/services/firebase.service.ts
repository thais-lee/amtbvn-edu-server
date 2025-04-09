import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const firebaseConfig = this.configService.get('firebase');

    if (!this.firebaseApp) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          privateKey: firebaseConfig.privateKey,
          clientEmail: firebaseConfig.clientEmail,
        }),
      });
    }
  }

  async sendNotification(
    tokens: string[],
    notification: admin.messaging.Notification,
    data?: Record<string, string>,
  ): Promise<admin.messaging.BatchResponse> {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification,
      data,
    };

    return this.firebaseApp.messaging().sendEachForMulticast(message);
  }
} 