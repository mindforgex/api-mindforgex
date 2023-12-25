import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/modules/base/services/base.service';
import { ChannelService } from 'src/modules/channels/services/channel.service';
import { DiscordService } from './discord.service';
import { UserService } from 'src/modules/users/services/user.service';
import { Task, TaskDocument } from '../models/task.model';
import { TASK_TYPE } from '../constants/task.constant';
import { TwitchService } from './twitch.service';
import {
  VerifyYoutubeInfo,
  VerifyYoutubeInfoDocument,
} from '../models/verify-youtube-info';
import axios from 'axios';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/request.dto';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { PostService } from 'src/modules/posts/services/post.service';
import { Post } from 'src/modules/posts/models/post.model';

@Injectable()
export class TaskService extends BaseService<TaskDocument> {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly discordService: DiscordService,
    private readonly twitchService: TwitchService,
    @InjectModel(VerifyYoutubeInfo.name)
    private readonly verifyYoutubeInfoModel: Model<VerifyYoutubeInfo>,
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
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
          if (
            !requestData.twitchId ||
            !requestData.twitchLogin ||
            !requestData.twitchAccessToken
          )
            throw new BadRequestException(
              'User has not connected to Twitch yet',
            );

          const result = await this.twitchService.verifyFollowChannel(
            taskInfo.serverId, // twitch channel login, ex: 'abab'
            requestData.twitchId, // twitch user id, ex: '123123'
            requestData.twitchAccessToken,
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

  public async storeUserInfoSubscribe(requestData: any, tokens: any) {
    const userInfo = await this.getUserInfo(tokens.access_token);
    const walletAddr = requestData.walletAddress;

    const info = await this.verifyYoutubeInfoModel
      .find({
        email: userInfo.email,
        walletAddr: walletAddr,
      })
      .lean();

    try {
      if (info) {
        // update
        await this.verifyYoutubeInfoModel.findOneAndUpdate(
          { _id: info[0]._id },
          {
            tokens: tokens,
          },
          { new: true },
        );
      } else {
        // create
        const data = {
          sub: userInfo.sub ?? '',
          userName: userInfo.name ?? '',
          email: userInfo.email ?? '',
          emailVerified: userInfo.email_verified ?? false,
          locale: userInfo.locale ?? '',
          picture: userInfo.picture ?? '',
          tokens: tokens,
          walletAddr: walletAddr,
        };
        await this.verifyYoutubeInfoModel.create(data);
      }
    } catch (error) {
      throw new Error(`Error store google authenticate info: ${error.message}`);
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userInfo = response.data;
      return userInfo;
    } catch (error) {
      console.error('Error during fetching user info:', error);
      throw error;
    }
  }

  public async getVerifyYoutubeInfoByUser(requestData: any) {
    const walletAddr = requestData.walletAddress;

    return this.verifyYoutubeInfoModel
      .findOne({ walletAddr: walletAddr })
      .lean();
  }

  public updateManyTask = async (
    filter?: FilterQuery<TaskDocument>,
    update?: UpdateQuery<TaskDocument>,
    option?: QueryOptions<TaskDocument>,
  ) => {
    const result = await this.taskModel.updateMany(filter, update, option);
    return result;
  };

  public deleteManyTask = async (
    filter?: FilterQuery<TaskDocument>,
    option?: QueryOptions<TaskDocument>,
  ) => {
    const result = await this.taskModel.deleteMany(filter, option);
    return result;
  };

  async createTask(dataTask: CreateTaskDto, user: IUser): Promise<Task> {
    //TODO: Verify permission
    const { _id: userId } = user;
    const { postId, name, title, description, link, serverId } = dataTask;

    // EXPLAIN: Create task
    const task = await this.taskModel.create({
      postId: new Types.ObjectId(postId),
      name,
      description,
      taskInfo: {
        title,
        link,
        serverId,
      },
    });

    // EXPLAIN: Add the taskId to the post's tasks field
    await this.postModel.findByIdAndUpdate(postId, {
      $push: { tasks: task._id },
    });

    return task;
  }

  async updateTask(
    dataChannel: UpdateTaskDto,
    taskId: string,
    user: IUser,
  ): Promise<Task> {
    const { postId, name, title, description, link, serverId } = dataChannel;
    //TODO: Verify permission

    const updateTask = await this.taskModel
      .findOneAndUpdate(
        { _id: taskId, postId: new Types.ObjectId(postId) },
        {
          name,
          description,
          taskInfo: {
            title,
            link,
            serverId,
          },
        },
        {
          new: true,
        },
      )
      .lean();
    return updateTask;
  }

  async deleteTask(taskId: string, user: IUser) {}
}
