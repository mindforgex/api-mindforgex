import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [FirebaseService, ConfigService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
