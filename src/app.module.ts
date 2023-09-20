import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/users/user.module';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { AppController } from './app.controller';
import * as mongoose from 'mongoose';

if (process.env.NODE_ENV === "develop") {
  mongoose.set('debug', true);
}

const modules = [
  AuthModule,
  UserModule,
  ChannelModule,
  PostModule,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      }
    }),
    ...modules,
  ],
  controllers: [AppController],
  providers: [
  ],
})
export class AppModule {}
