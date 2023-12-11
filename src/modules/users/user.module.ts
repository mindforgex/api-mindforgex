import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { mongooseSoftDeletePlugin } from 'src/common/plugins/mongoose-soft-delete.plugin';

import { UserController } from './user.controller';

import { UserService } from './services/user.service';

import { User, UserSchema } from './models/user.model';
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        // schema: UserSchema.plugin(mongooseSoftDeletePlugin),
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
