import { Module, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { program } from 'commander';
import { Types } from 'mongoose';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { NFTInfoModule } from 'src/modules/nfts/nft.module';
import { TaskModule } from 'src/modules/tasks/task.module';

import { ChannelService } from 'src/modules/channels/services/channel.service';
import { PostService } from 'src/modules/posts/services/post.service';
import { NFTInfoService } from 'src/modules/nfts/services/nft-info.service';
import { TaskService } from 'src/modules/tasks/services/task.service';

@Module({
  imports: [
    ChannelModule,
    PostModule,
    NFTInfoModule,
    TaskModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const updateChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const service = app.get(ChannelService);
  const postService = app.get(PostService);
  const nftInfoService = app.get(NFTInfoService);
  const taskService = app.get(TaskService);

  const channelData = require('src/common/data-template/channel.json');
  const postData = require('src/common/data-template/post.json');
  const nftInfoData = require('src/common/data-template/nft.json');

  try {
    const params = {
      aboutMe: `<iframe width="1280" height="720" src="https://www.youtube.com/embed/UmzlreolyvY" title="釣り堀り🐟女子4人ガチ釣り対決！！【Karen(Demondice)/ Giri/ Projekt Melody/ kson】" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
      donateReceiver: '24kY31QV3THUemS6cS7HLWgWXK2KrBPZbcYAgqx3U5ww',
      nftCollections: []
    }
    const updateChannels = await service.updateMultiChannel(params);

    console.log('Update channel successfully');
  } catch (error) {
    console.log('Update channel fail!', error);
  }

  await app.close();
  process.exit(0);
}

updateChannel();
