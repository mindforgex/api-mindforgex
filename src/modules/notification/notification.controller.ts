import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { UserParams } from 'src/decorators/user-params.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Role } from '../users/constants/user.constant';
import { RolesGuard } from 'src/guards/roles.guard';
import { google } from 'googleapis';

const scopes: any = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/youtube.readonly'
];

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  private oauth2Client: any;
  constructor(
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      '237263602945-o2hpvb524rp84nqb002batne9qi0d88k.apps.googleusercontent.com',
      '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',
      'http://localhost:3003/v1/notification/google/callback'
    );
  }

  @Get()
  async notification() {
    await this.firebaseService.sendNotificationToUser();
    return { data: null, message: 'success' };
  }
  @Get('/users')
  async notificationUsers() {
    await this.firebaseService.sendNotificationToUsers();
    return { data: null, message: 'success' };
  }

  @Get('/authenticat-url')
  async getUrl() {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      redirect_uri: 'http://localhost:3003/v1/notification/google/callback'
    });
    return { data: url, message: 'success' };
  }

  @Get('/google/callback')
  async googleCallback(@Param() params: any, @Query() query: any) {
    console.log({ params });
    console.log({ query });
    const { tokens } = await this.oauth2Client.getToken(query?.code)
    this.oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });

    const { data: { items } } = await youtube.channels.list({
      "part": [
        "snippet,contentDetails"
      ],
      mine: true
    });

    const [channel] = items;

    const res = await youtube.subscriptions.list({
      "part": [
        "snippet,contentDetails"
      ],
      "channelId": channel.id,
      "forChannelId": "UCndcERoL9eG-XNljgUk1Gag",
    });
    return { data: res, message: 'success' };
    
  }
}
  