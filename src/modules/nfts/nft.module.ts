import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NftController } from './nft.controller';

import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { NFTInfoService } from './services/nft-info.service';
import { NFTReceiveService } from './services/nft-receive.service';
import { ChannelService } from '../channels/services/channel.service';
import { RewardHistoryService } from '../reward/services/reward-history.service';
import { NFTCollectionService } from './services/nft-collection.service';

import {
  NFTCollection,
  NFTCollectionSchema,
} from './models/nft-collection.model';
import { NFTInfo, NFTInfoSchema } from './models/nft-info.model';
import { NFTReceive, NFTReceiveSchema } from './models/nft-receive.model';
import { Channel } from 'diagnostics_channel';
import { ChannelSchema } from '../channels/models/channel.model';
import {
  RewardHistory,
  RewardHistorySchema,
} from '../reward/models/reward-history.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NFTCollection.name,
        schema: NFTCollectionSchema,
      },
      {
        name: NFTInfo.name,
        schema: NFTInfoSchema,
      },
      {
        name: NFTReceive.name,
        schema: NFTReceiveSchema,
      },
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
      {
        name: RewardHistory.name,
        schema: RewardHistorySchema,
      },
    ]),
  ],
  controllers: [NftController],
  providers: [
    NFTCollectionService,
    NFTInfoService,
    NFTReceiveService,
    ShyftWeb3Service,
    ChannelService,
    RewardHistoryService,
  ],
  exports: [NFTCollectionService, NFTInfoService, NFTReceiveService],
})
export class NFTInfoModule {}
