import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { uuid } from 'uuidv4';

@Injectable()
export class FirebaseService {
  private readonly messaging: admin.messaging.Messaging;
  private db: admin.database.Database;

  constructor(
    private readonly configService: ConfigService
  ) {
    admin.initializeApp({
        credential: admin.credential.cert({
          clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
          projectId: configService.get('FIREBASE_PROJECT_ID')
        }),
        databaseURL: configService.get('FIREBASE_DB_URL')
    });
    this.messaging = admin.messaging();
  }

  async sendNotificationToUser() {
    const message = {
      data: {score: '850', time: '2:45'},
      notification: {
        body: "Notification",
        image: "https://vnmedia.monkeyuni.net/upload/web/img/3-x-so-la-ma.jpg",
        title: "App"
      },
      token: 'f_VE-XQcTU3etAZv662rGC:APA91bHJUo9wPrrXBkTsPPGl_meGK0JCEgHMxMFhxFbCMRdUqZ4lqWMWKgmizYjIXQf3OY01g9xgV3lShTa_e2VxFSGVnIwr25nVndaGSAHZ43Bmwl1AQ0xl_YWokfbM2vNHRcvvMtIp'
    };
    try {
      await this.messaging.send(message);
      console.log('Send message success');
    } catch(err) {
      console.error('send message error ::: ', err.message);
      throw err;
    }
  }

  async sendNotificationToUsers() {
    const message = {
      data: {score: '850', time: '2:45'},
      notification: {
        body: "Notification",
        image: "https://vnmedia.monkeyuni.net/upload/web/img/3-x-so-la-ma.jpg",
        title: "App"
      },
      tokens: [
        'f_VE-XQcTU3etAZv662rGC:APA91bHJUo9wPrrXBkTsPPGl_meGK0JCEgHMxMFhxFbCMRdUqZ4lqWMWKgmizYjIXQf3OY01g9xgV3lShTa_e2VxFSGVnIwr25nVndaGSAHZ43Bmwl1AQ0xl_YWokfbM2vNHRcvvMtIp',
        'd-KhXAuC490v9WcoiDQn_q:APA91bFIGcfwM9j3me72IETOjIaKE_x2WcQ-bnFTt1NrikklI1Bx70jdkF0W_rnMVdGjbU6XzdavlEiY7idLYANHxqSBM1lRBpZ7TGnS-d9S7KdzG2bSC4wRiI7Oyuy_5TXF4ZmPAtxS'
      ]
    };
    try {
      await this.messaging.sendEachForMulticast(message);
      console.log('Send message success');
    } catch(err) {
      console.error('send message error ::: ', err.message);
      throw err;
    }
  }
}
