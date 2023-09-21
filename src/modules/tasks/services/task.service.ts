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

@Injectable()
export class TaskService extends BaseService<TaskDocument> {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
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

  async verify(taskId: string, requestData: any): Promise<any> {
    const userVerify = requestData.userAddress;

    try {
      const updatedTask = await this.taskModel.findOneAndUpdate(
        { _id: taskId, userAddress: { $nin: [userVerify] } },
        {
          $push: { userAddress: userVerify },
        },
        { new: true },
      );

      if (!updatedTask)
      throw new BadRequestException('already subscribed')



      // const task = await this.taskModel.findOne({ _id: taskId }).lean();
      // if (!task) {
      //   return null;
      // }

      // const userAddress = task.userAddress;
      // const user = userAddress.find((user) => user === userVerify) || '';
      // if (user !== '') {
      //   return null;
      // }

      // task.userAddress.push(userVerify);
      // const updatedTask = await task.save();

      return updatedTask;
    } catch (error) {
      throw new Error(`Error adding user to verify list: ${error.message}`);
    }
  }
}
