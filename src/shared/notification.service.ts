import {
  AdminNotificationDto,
  CreateNotificationDto
} from '@common/dto/create-notification.dto';
import { db } from '@common/utils/dbClient';
import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as serviceAccount from '../../push-notification.json';
import { getNotificationContent } from '@common/utils/notifications';
import { NotificationType } from '@prisma/client';
export interface ISendFirebaseMessages {
  token: string;
  title?: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  private readonly notifications = db.notification;
  constructor() {
    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount as ServiceAccount)
    });
    console.log('Firebase initialized');
  }

  async sendFirebaseMessages(data: ISendFirebaseMessages) {
    const message = {
      notification: {
        title: data.title,
        body: data.message
      },
      token: data.token
    };
    await firebase.messaging().send(message);
    console.log('Message sent successfully');
  }

  async create(data: CreateNotificationDto) {
    const user = await db.user.findUnique({
      where: {
        id: data.userId
      }
    });
    if (user.deviceToken) {
      await this.notifications.create({
        data: {
          type: data.type,
          context: data.context,
          userId: data.userId
        }
      });
      const message = getNotificationContent(
        NotificationType[data.type],
        data.context
      );
      try {
        this.sendFirebaseMessages({
          token: user.deviceToken,
          message
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getUserNotifications(userId: string) {
    const result = await this.notifications.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    const list = result.map(item => ({
      ...item,
      content: getNotificationContent(NotificationType[item.type], item.context)
    }));
    return {
      notifications: list
    };
  }
  async sendNotificationToAllUsers(dto: AdminNotificationDto) {
    const users = await db.user.findMany({
      where: {
        deviceToken: {
          not: null
        }
      }
    });
    await this.notifications.createMany({
      data: users.map(user => ({
        type: NotificationType.FROM_ADMIN,
        context: {
          ...dto
        },
        userId: user.id
      }))
    });
    users.forEach(async user => {
      if (user.deviceToken) {
        // const message = getNotificationContent(
        //   NotificationType[NotificationType.NEW_POST],
        //   '5'
        // );
        try {
          this.sendFirebaseMessages({
            token: user.deviceToken,
            title: dto.title,
            message: dto.body
          });
        } catch (error) {
          console.log(error);
        }
      }
    });

    return {};
  }
}
