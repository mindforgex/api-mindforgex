import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelController } from './channel.controller';
import { ChannelService } from './services/channel.service';
import { Channel, ChannelSchema } from './models/channel.model';
import { DonateService } from '../donates/services/donate.service';
import { Donate, DonateSchema } from '../donates/models/donate.model';
import { NFTCollection, NFTCollectionSchema } from 'src/modules/nfts/models/nft-collection.model';

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
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService, DonateService],
  exports: [ChannelService, DonateService],
})
export class ChannelModule {}
