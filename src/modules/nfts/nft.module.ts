import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NftController } from './nft.controller';

import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { NFTInfoService } from './services/nft-info.service';
import { NFTReceiveService } from './services/nft-receive.service';

import {
  NFTCollection,
  NFTCollectionSchema,
} from './models/nft-collection.model';
import { NFTInfo, NFTInfoSchema } from './models/nft-info.model';
import { NFTReceive, NFTReceiveSchema } from './models/nft-receive.model';
import { ChannelService } from '../channels/services/channel.service';

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
    ]),
  ],
  controllers: [NftController],
  providers: [
    NFTCollection,
    NFTInfoService,
    NFTReceiveService,
    ChannelService,
    ShyftWeb3Service,
  ],
  exports: [NFTCollection, NFTInfoService, NFTReceiveService],
})
export class NFTInfoModule {}
