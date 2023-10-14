/* eslint-disable @typescript-eslint/no-var-requires */
import { Module, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ChannelModule } from 'src/modules/channels/channel.module';
import { PostModule } from 'src/modules/posts/post.module';
import { TaskModule } from 'src/modules/tasks/task.module';

import { ChannelService } from 'src/modules/channels/services/channel.service';
import { PostService } from 'src/modules/posts/services/post.service';
import { NFTInfoModule } from 'src/modules/nfts/nft.module';
import { TaskService } from 'src/modules/tasks/services/task.service';
import { NFTCollectionService } from 'src/modules/nfts/services/nft-collection.service';
import { NFTInfoService } from 'src/modules/nfts/services/nft-info.service';
import { RewardService } from 'src/modules/reward/services/reward.service';
import { RewardModule } from 'src/modules/reward/reward.module';
import { RewardHistoryService } from 'src/modules/reward/services/reward-history.service';

@Module({
  imports: [
    ChannelModule,
    PostModule,
    NFTInfoModule,
    TaskModule,
    RewardModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const seedChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const channelService = app.get(ChannelService);
  const postService = app.get(PostService);
  const taskService = app.get(TaskService);
  const nftCollectionService = app.get(NFTCollectionService);
  const nftInfoService = app.get(NFTInfoService);
  const rewardService = app.get(RewardService);
  const rewardHistoryService = app.get(RewardHistoryService);

  const channelData = require('src/common/data-template-v2/channel.json');
  const postData = require('src/common/data-template-v2/post.json');
  const taskData = require('src/common/data-template-v2/task.json');
  const rewardData = require('src/common/data-template-v2/reward.json');
  const collectionData = require('src/common/data-template-v2/collection.json');
  const collectionItemData = require('src/common/data-template-v2/collection_item.json');

  const params = [];
  for (let i = 0; i < channelData.length; i++) {
    params.push({
      _id: new Types.ObjectId(channelData[i]._id),
      name: channelData[i].name,
      channelName: channelData[i].channelName,
      avatarUrl: channelData[i].avatar,
      description: channelData[i].description,
      socialLinks: channelData[i].socialLinks,
      country: channelData[i].country,
      founded: channelData[i].founded,
      mainGame: channelData[i].mainGame,
      profestionalFeild: channelData[i].profestionalFeild,
      email: channelData[i].email,
      sex: channelData[i].sex,
      dateOfBirth: channelData[i].dateOfBirth,
      twitterUrl: channelData[i].twitterUrl,
      youtubeUrl: channelData[i].youtubeUrl,
      follower: channelData[i].follower,
      followerYoutube: channelData[i].followerYoutube,
      followerTwitter: channelData[i].followerTwitter,
      userSubcribe: [],
    });
  }

  try {
    await channelService.clearChannels();
    await postService.clearPosts();
    await taskService.clearTasks();
    await rewardService.clear();
    await rewardHistoryService.clear();
    await nftCollectionService.clear();
    await nftInfoService.clearNFTInfos();

    console.info('Creating channel');
    const channels = await channelService.createMultiChannel(params);
    console.info('Create channel done');

    for (const channel of channels) {
      console.info('Creating collection');
      const _externalUrl = `https://mindforgex.relipa.vn/channel/${channel._id}`;
      const nftCollection = await nftCollectionService.createMany(
        await _formatCollectionData(
          collectionData.map((_collection) => {
            _collection.externalUrl = _externalUrl;
            _collection.attributes[0].value = _externalUrl;
            return _collection;
          }),
          channel.donateReceiver,
        ),
        channel._id.toString(),
      );
      console.info('Create collection done');

      let nftInfoId = [];
      for (let i = 0; i < nftCollection.length; i++) {
        const _nftCollection = nftCollection[i];
        console.info('Creating nft info');
        const currentNftInfoOfCollection = collectionItemData[i.toString()];
        const nftInfo = await nftInfoService.createMultiNFTInfos(
          currentNftInfoOfCollection.map((_item) => ({
            ..._item,
            external_url: _externalUrl,
            nft_collection_address: _nftCollection.address,
          })),
        );
        nftInfoId = nftInfo.map((_item) => _item._id);
        console.info('Create nft done');

        console.info('Creating reward');
        await rewardService.createMany(
          rewardData.map((_item) => ({
            ..._item,
            nft_collection_address: _nftCollection.address,
          })),
        );
        console.info('Create reward done');
      }

      const postParams = postData.map((post, index) => ({
        channelId: channel._id,
        title: post.title,
        content: post.content,
        images: post.images,
        practicipants: post.practicipants,
        nftMinted: post.nftMinted,
        nftId: new Types.ObjectId(nftInfoId[index]),
      }));
      console.info('Creating post');
      const createdPosts = await postService.createMultiPosts(
        channel._id,
        postParams,
      );
      console.info('Create post done');

      for (const post of createdPosts) {
        const taskParams = taskData.map((task) => ({
          postId: new Types.ObjectId(post._id),
          name: task.name,
          description: task.description,
          taskInfo: task.taskInfo,
          taskType: task.taskType,
          userAddress: [],
        }));
        console.info('Creating task');
        const createdTasks = await taskService.createMultiTasks(taskParams);
        console.info('Create task done');

        post.tasks = createdTasks;
        await post.save();
      }

      // update post to channel
      console.info('Updating channel');
      channel.posts = createdPosts;
      console.info('Update channel done');
      await channel.save();
    }

    console.log('Seed channel successfully');
  } catch (error) {
    console.log('Seed channel fail!', error);
  }

  await app.close();
  process.exit(0);
};

async function _formatCollectionData(data, channelWallet) {
  const _formatData = await Promise.all(
    data.map(async (_item) => {
      // fetch img buffer
      const imageBuffer = await fetchBufferImage(_item.imageUri);

      return {
        _id: _item._id,
        imageBuffer: imageBuffer,
        receiver: channelWallet,
        externalUrl: _item.externalUrl,
        name: _item.name,
        symbol: _item.symbol,
        description: _item.description,
        attributes: _item.attributes,
      };
    }),
  );

  return _formatData;
}

async function fetchBufferImage(url: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

seedChannel();
