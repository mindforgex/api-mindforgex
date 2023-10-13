import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TaskController } from './task.controller';
import { UserModule } from '../users/user.module';

import { ChannelService } from '../channels/services/channel.service';
import { TaskService } from './services/task.service';
import { DiscordService } from './services/discord.service';
import { PostService } from '../posts/services/post.service';

import { Channel, ChannelSchema } from '../channels/models/channel.model';
import { DonateService } from '../donates/services/donate.service';
import { Donate, DonateSchema } from '../donates/models/donate.model';
import { Task, TaskSchema } from './models/task.model';
import { Post, PostSchema } from '../posts/models/post.model';

import { NFTCollection, NFTCollectionSchema } from 'src/modules/nfts/models/nft-collection.model';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
      {
        name: Donate.name,
        schema: DonateSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: NFTCollection.name,
        schema: NFTCollectionSchema
      }
    ]),
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    ChannelService,
    DonateService,
    DiscordService,
    PostService,
  ],
  exports: [TaskService, ChannelService],
})
export class TaskModule {}
