import { Module, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { program } from 'commander';
import { Types } from 'mongoose';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { NFTInfoModule } from 'src/modules/nft_infos/nft_info.module';

import { ChannelService } from 'src/modules/channels/services/channel.service';
import { PostService } from 'src/modules/posts/services/post.service';
import { NFTInfoService } from 'src/modules/nft_infos/services/nft_info.service';

@Module({
  imports: [
    ChannelModule,
    PostModule,
    NFTInfoModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const seedChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const service = app.get(ChannelService);
  const postService = app.get(PostService);
  const nftInfoService = app.get(NFTInfoService);

  const channelData = require('src/common/data_template/channel_info.json');
  const nftInfoData = require('src/common/data_template/nft_info.json');

  let params = [];
  for (let i = 0; i < channelData.length; i++) {
    params.push({
      "channelName": channelData[i].name,
      "avatarUrl": channelData[i].avatar,
      "socialLinks": channelData[i].socialLinks,
      "country": channelData[i].country,
      "founder": channelData[i].founder,
      "mainGame": channelData[i].mainGame,
      "profestionalFeild": channelData[i].profestionalFeild,
      "email": channelData[i].email,
      "age": channelData[i].age,
      "twitterUrl": channelData[i].twitterUrl,
      "youtubeUrl": channelData[i].youtubeUrl,
      "follwerYoutube": channelData[i].follwerYoutube,
      "follwerTwitter": channelData[i].follwerTwitter,
    });
  }

  try {
    await service.clearChannels();
    await postService.clearPosts();
    await nftInfoService.clearNFTInfos();

    const channels = await service.createMultiChannel(params);

    for (const channel of channels) {
      const postData = channelData.find((data) => data.name === channel.channelName)?.post || [];
      const postParams = postData.map((post) => ({
        channelId: channel._id,
        content: post.content,
        images: post.images,
      }));
      const createdPosts = await postService.createMultiPosts(channel._id, postParams);

      const nftData = nftInfoData.sort(() => Math.random() - 0.5).slice(0, 2);
      const nftInfoParams = nftData.map((nft) => ({
        channelId: channel.id,
        name: nft.name,
        image: nft.image,
        metaData: nft.metaData,
      }));
      const createdNFTInfos = await nftInfoService.createMultiNFTInfos(channel._id, nftInfoParams);

      // update post to chanels
      channel.posts = createdPosts;
      channel.nftInfos = createdNFTInfos;
      await channel.save();
    }

    console.log('Seed channel successfully');
  } catch (error) {
    console.log('Seed channel fail!', error);
  }

  await app.close();
  process.exit(0);
}

seedChannel();
