import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NftController } from './nft.controller';

import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { NFTInfoService } from './services/nft-info.service';
import { NFTReceiveService } from './services/nft-receive.service';

import { NFTInfo, NFTInfoSchema } from './models/nft-info.model';
import { NFTReceive, NFTReceiveSchema } from './models/nft-receive.model';

@Module({
  imports: [
    MongooseModule.forFeature([
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
  providers: [NFTInfoService, NFTReceiveService, ShyftWeb3Service],
  exports: [NFTInfoService, NFTReceiveService],
})
export class NFTInfoModule {}
