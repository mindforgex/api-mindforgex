import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';
import { ChannelService } from 'src/modules/channels/services/channel.service';
import { DiscordService } from './discord.service';
import { UserService } from 'src/modules/users/services/user.service';

import { Task, TaskDocument } from '../models/task.model';

import { TASK_TYPE } from '../constants/task.constant';
import { TwitchService } from './twitch.service';
@Injectable()
export class TaskService extends BaseService<TaskDocument> {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly discordService: DiscordService,
    private readonly twitchService: TwitchService,
  ) {
    super(taskModel);
  }

  private readonly defaultSelectFields: string = '';

  public async createMultiTasks(dataArray: any[]) {
    try {
      const posts = await this.taskModel.create(dataArray);
      return posts;
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clearTasks() {
    return this.taskModel.deleteMany({});
  }

  public async getTasksByPostId(postId: string) {
    return this.taskModel.find({ postId: new Types.ObjectId(postId) });
  }

  public async updateAll(query: any, update: any, option?: any) {
    return this.taskModel.updateMany(query, update, option).lean();
  }

  public findOneById = (taskId: string, selectFields?: string) =>
    this.taskModel
      .findOne({ _id: taskId }, selectFields ?? this.defaultSelectFields)
      .lean();

  async verify(
    taskId: string,
    taskType: TASK_TYPE,
    taskInfo: any,
    requestData: any,
    body: any,
  ): Promise<any> {
    const userVerify = requestData.walletAddress;
    const channelId = body.channelId;
    const taskVerified = await this.taskModel.findOne({
      _id: taskId,
      userAddress: { $in: [userVerify] },
    });

    if (taskVerified) throw new BadRequestException('already verified');

    try {
      switch (taskType) {
        case TASK_TYPE.SUBSCRIBE_WEB3_CHANNEL: {
          // check user subscribed.
          const channel = await this.channelService.getChannelByUserSubscribe(
            channelId,
            userVerify,
          );

          if (!channel) {
            throw new BadRequestException('not subscribed yet');
          }
          break;
        }
        case TASK_TYPE.JOIN_DISCORD: {
          const userInfo = await this.userService.findOneByWalletAddress(
            userVerify,
          );

          const result = await this.discordService.verifyDiscordTask(
            userInfo.discordId,
            taskInfo.serverId,
          );

          if (!result)
            throw new BadRequestException(`User is not in discord server`);
          break;
        }
        case TASK_TYPE.SUBSCRIBE_TWITCH: {
          const userTwitchProfile = await this.twitchService.getUser(
            body.twitchAccessToken,
            requestData.twitchId,
          );
          if (!userTwitchProfile)
            throw new BadRequestException("Invalid 'twitchAccessToken'");

          const result = await this.twitchService.verifyFollowChannel(
            taskInfo.serverId, // twitch channel login, ex: 'abab'
            requestData.twitchId, // twitch user id, ex: '123123'
            body.twitchAccessToken,
          );
          if (!result)
            throw new BadRequestException(
              `User has not subscribed channel yet.`,
            );
          break;
        }
        default:
          throw new BadRequestException('Invalid task');
      }

      // check and insert user to user verify list.
      const updatedTask = await this.taskModel.findOneAndUpdate(
        { _id: taskId, userAddress: { $nin: [userVerify] } },
        {
          $push: { userAddress: userVerify },
        },
        { new: true },
      );

      if (!updatedTask) throw new BadRequestException('verify fail');

      return updatedTask;
    } catch (error) {
      this.logger.error('verify', error);
      throw error;
    }
  }
}
