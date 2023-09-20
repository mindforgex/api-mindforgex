import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { mongooseSoftDeletePlugin } from 'src/common/plugins/mongoose-soft-delete.plugin';

import { ChannelController } from './channel.controller';

import { ChannelService } from './services/channel.service';

import { Channel, ChannelSchema } from './models/channel.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Channel.name,
        // schema: UserSchema.plugin(mongooseSoftDeletePlugin),
        schema: ChannelSchema,
      },
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
