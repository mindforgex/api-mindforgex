/* eslint-disable @typescript-eslint/no-var-requires */
import { Module, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NFTInfoModule } from 'src/modules/nfts/nft.module';

import { NFTInfoService } from 'src/modules/nfts/services/nft-info.service';
import { NFTCollectionService } from 'src/modules/nfts/services/nft-collection.service';

import { RewardModule } from 'src/modules/reward/reward.module';
import { RewardService } from 'src/modules/reward/services/reward.service';

@Module({
  imports: [
    RewardModule,
    NFTInfoModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}
// collection -> item
//            -> reward
export const seedChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const nftCollectionService = app.get(NFTCollectionService);
  const nftInfoService = app.get(NFTInfoService);
  const rewardService = app.get(RewardService);

  // const nftCollectionDataSeed = require('src/common/data-template/nft-collection-seed.json');
  const nftCollectionDataNew = require('src/common/data-template/nft-collection-new.json');
  const rewardData = require('src/common/data-template/reward.json');

  //////// seeding new ////////
  // const seedingNFTCollectionData: INFTCollection[] = nftCollectionDataSeed.map(
  //   (_item) => ({
  //     _id: _item._id,
  //     address: _item.address,
  //     owner_address: _item.owner_address,
  //     channel_id: new Types.ObjectId(_item.channel_id),
  //     metadata_uri: _item.metadata_uri,
  //   }),
  // );

  // const nftCollection = await nftCollectionService.insertMany(
  //   seedingNFTCollectionData,
  // );
  // console.log(nftCollection);
  ////////////////////////////////

  //////// seeding data ////////
  for (const _channelId in nftCollectionDataNew) {
    const _nftCollectionDataNew = nftCollectionDataNew[_channelId];
    const _formatData = await Promise.all(
      _nftCollectionDataNew.map(async (_item) => {
        // fetch img buffer
        const imageBuffer = await fetchBufferImage(_item.imageUri);

        return {
          _id: _item._id,
          imageBuffer: imageBuffer,
          receiver: '7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd',
          externalUrl: _item.externalUrl,
          name: _item.name,
          symbol: _item.symbol,
          description: _item.description,
          attributes: _item.attributes,
        };
      }),
    );

    const nftCollection = await nftCollectionService.createMany(
      _formatData,
      _channelId,
    );
    console.log('nftCollection', { nftCollection });
    if (nftCollection.length === 0) continue;

    for (let i = 0; i < nftCollection.length; i++) {
      const _currentNFTCollection = _nftCollectionDataNew.find(
        (_item) => _item._id === nftCollection[i]._id.toString(),
      );
      const nftInfo = await nftInfoService.createMultiNFTInfos(
        _nftCollectionDataNew[0].nft_info.map((_item) => ({
          ..._item,
          nft_collection_address: _currentNFTCollection.address,
        })),
      );
      console.log('nftInfo', { nftInfo });

      const reward = await rewardService.createMany(
        rewardData.map((_item) => ({
          ..._item,
          nft_collection_address: _currentNFTCollection.address,
        })),
      );
      console.log('reward', { reward });
    }
  }
  ////////////////////////////////

  await app.close();
  process.exit(0);
};

async function fetchBufferImage(url: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

seedChannel();
