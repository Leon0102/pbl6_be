import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as serviceAccount from '../../push-notification.json';

export interface ISendFirebaseMessages {
  token: string;
  title?: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor() {
    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount as ServiceAccount),
    });
    console.log('Firebase initialized');
  }

  async sendFirebaseMessages(data: ISendFirebaseMessages) {
    const message = {
      notification: {
        title: data.title,
        body: data.message,
      },
      token: data.token,
    };
    await firebase.messaging().send(message);
    console.log('Message sent successfully');
  }
}
