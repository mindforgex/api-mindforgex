import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelController } from './channel.controller';
import { ChannelService } from './services/channel.service';
import { Channel, ChannelSchema } from './models/channel.model';
import { DonateService } from '../donates/services/donate.service';
import { Donate, DonateSchema } from '../donates/models/donate.model';
import {
  NFTCollection,
  NFTCollectionSchema,
} from 'src/modules/nfts/models/nft-collection.model';
import { UserService } from '../users/services/user.service';
import { User, UserSchema } from '../users/models/user.model';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
      {
        name: Donate.name,
        schema: DonateSchema,
      },
      {
        name: NFTCollection.name,
        schema: NFTCollectionSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService, DonateService, UserService],
  exports: [ChannelService, DonateService, UserService],
})
export class ChannelModule {}
