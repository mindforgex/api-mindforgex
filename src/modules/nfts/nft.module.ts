import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NftController } from './nft.controller';

import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { NFTInfoService } from './services/nft-info.service';
import { NFTReceiveService } from './services/nft-receive.service';
import { ChannelService } from '../channels/services/channel.service';
import { RewardHistoryService } from '../reward/services/reward-history.service';
import { NFTCollectionService } from './services/nft-collection.service';
import { DonateService } from '../donates/services/donate.service';
import { RewardService } from '../reward/services/reward.service';

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
import { Reward, RewardSchema } from '../reward/models/reward.model';
import {
  Donate,
  DonateSchema,
} from '../donates/models/donate.model';


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
      {
        name: Reward.name,
        schema: RewardSchema,
      },
      {
        name: Donate.name,
        schema: DonateSchema,
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
    RewardService,
    DonateService,
  ],
  exports: [NFTCollectionService, NFTInfoService, NFTReceiveService],
})
export class NFTInfoModule {}
