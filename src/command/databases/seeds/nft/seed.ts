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

import NFTCollectionData from 'src/common/data-template/nft-collection.json';
import { NFTCollectionService } from 'src/modules/nfts/services/nft-collection.service';

@Module({
  imports: [
    ChannelModule,
    PostModule,
    NFTInfoModule,
    TaskModule,
    NFTInfoModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const seedChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  // const nftCollectionService = app.get(NFTCollectionService);

  // const nftCollection = await nftCollectionService.createMany([{}], '123');
  // console.log(nftCollection);
  await app.close();
  process.exit(0);
};

seedChannel();
