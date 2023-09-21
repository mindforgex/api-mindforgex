import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import {
  SORT_CONDITION,
} from '../constants/task.constant';

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
      const posts = await this.taskModel.create(dataArray.map((data) => ({ ...data, channel: channelId })));
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
}
