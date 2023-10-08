/* eslint-disable @typescript-eslint/no-var-requires */
import { Module, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { NFTInfoModule } from 'src/modules/nfts/nft.module';
import { TaskModule } from 'src/modules/tasks/task.module';

import { ChannelService } from 'src/modules/channels/services/channel.service';
import { PostService } from 'src/modules/posts/services/post.service';
import { NFTInfoService } from 'src/modules/nfts/services/nft-info.service';
import { TaskService } from 'src/modules/tasks/services/task.service';
import { NFTCollectionService } from 'src/modules/nfts/services/nft-collection.service';

import { INFTCollection } from 'src/modules/nfts/interfaces/nft-info.interface';

@Module({
  imports: [
    // ChannelModule,
    // PostModule,
    // TaskModule,
    NFTInfoModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const seedChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const nftCollectionService = app.get(NFTCollectionService);
  const nftInfoService = app.get(NFTInfoService);

  const nftCollectionDataSeed = require('src/common/data-template/nft-collection-seed.json');

  const seedingNFTCollectionData: INFTCollection[] = nftCollectionDataSeed.map(
    (_item) => ({
      address: _item.address,
      owner_address: _item.owner_address,
      channel_id: new Types.ObjectId(_item.channel_id),
      metadata_uri: _item.metadata_uri,
    }),
  );

  const nftCollection = await nftCollectionService.insertMany(
    seedingNFTCollectionData,
  );
  console.log(nftCollection);

  const nftInfo = await nftInfoService.createMultiNFTInfos(
    nftCollectionDataSeed[0].nft_info,
  );
  console.log(nftInfo);

  await app.close();
  process.exit(0);
};

seedChannel();
