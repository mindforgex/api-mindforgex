import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';
import { ChannelService } from 'src/modules/channels/services/channel.service';
import { Task, TaskDocument } from '../models/task.model';
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
    return this.taskModel.deleteMany({});
  }

  public async getTasksByPostId(postId: string) {
    return this.taskModel.find({ postId: new Types.ObjectId(postId) });
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
      const channel = await this.channelService.getChannelByUserSubscribe(
        channelId,
        userVerify,
      );

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
