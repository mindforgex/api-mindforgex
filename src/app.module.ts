import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/users/user.module';

import { AppController } from './app.controller';

const modules = [
  AuthModule,
  UserModule,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    ...modules,
  ],
  controllers: [AppController],
  providers: [
  ],
})
export class AppModule {}
