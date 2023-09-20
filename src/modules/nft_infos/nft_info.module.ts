import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NftInfoController } from './nft_info.controller';

import { NFTInfoService } from './services/nft_info.service';

import { NFTInfo, NFTInfoSchema } from './models/nft_info.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NFTInfo.name,
        schema: NFTInfoSchema,
      },
    ]),
  ],
  controllers: [NftInfoController],
  providers: [NFTInfoService],
  exports: [NFTInfoService],
})
export class NFTInfoModule {}
