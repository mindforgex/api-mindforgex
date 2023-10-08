/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { NFTInfoModule } from 'src/modules/nfts/nft.module';
import { TaskModule } from 'src/modules/tasks/task.module';
import { UserModule } from 'src/modules/users/user.module';
import { RewardModule } from './modules/reward/reward.module';
import { AppController } from './app.controller';

const modules = [
  AuthModule,
  UserModule,
  ChannelModule,
  PostModule,
  NFTInfoModule,
  TaskModule,
  RewardModule,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    CacheModule.register({
      ttl: 1 * 1000,
      isGlobal: true,
    }),
    ...modules,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
