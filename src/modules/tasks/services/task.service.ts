import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { SORT_CONDITION } from '../constants/task.constant';
import { BaseService } from 'src/modules/base/services/base.service';
import { Task, TaskDocument } from '../models/task.model';
import { ChannelService } from 'src/modules/channels/services/channel.service';
@Injectable()
export class TaskService extends BaseService<TaskDocument> {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly channelService: ChannelService,
  ) {
    super(taskModel);
  }

  private readonly defaultSelectFields: string = '';

  public async createMultiTasks(channelId: string, dataArray: any[]) {
    try {
      const posts = await this.taskModel.create(
        dataArray.map((data) => ({ ...data, channel: channelId })),
      );
      return posts;
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clearTasks() {
    try {
      // Delete all channels info
      await this.taskModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing channels: ${error.message}`);
    }
  }

  public async getListTaskByPostId(postId: string) {
    try {
      const tasks = await this.taskModel.find({ post: postId }).exec();
      return tasks;
    } catch (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
    }
  }

  public findOneById = (taskId: string, selectFields?: string) =>
    this.taskModel
      .findOne({ _id: taskId }, selectFields ?? this.defaultSelectFields)
      .lean();

  async verify(taskId: string, requestData: any, body: any): Promise<any> {
    const userVerify = requestData.walletAddress;
    const channelId = body.channelId;

    try {
      // check user subscribed.
      const channel = await this.channelService.getChannelByUserSubcribe(channelId, userVerify);

      if (!channel) {
        throw new BadRequestException('not subscribed yet');
      }

      // check and insert user to user verify list.
      const updatedTask = await this.taskModel.findOneAndUpdate(
        { _id: taskId, userAddress: { $nin: [userVerify] } },
        {
          $push: { userAddress: userVerify },
        },
        { new: true },
      );

      if (!updatedTask) {
        throw new BadRequestException('verify fail');
      }

      return updatedTask;
    } catch (error) {
      throw new Error(`Error adding user to verify list: ${error.message}`);
    }
  }
}
