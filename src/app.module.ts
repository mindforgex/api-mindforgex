import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { NFTInfoModule } from 'src/modules/nft_infos/nft_info.module';
import { UserModule } from 'src/modules/users/user.module';
import { AppController } from './app.controller';

const modules = [
  AuthModule,
  UserModule,
  ChannelModule,
  PostModule,
  NFTInfoModule,
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
    ...modules,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
