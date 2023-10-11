import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { ITask } from '../interfaces/task.interface';
import { TASK_TYPE } from '../constants/task.constant';

import { TaskSnsDto } from '../dtos/request.dto';

@Schema({ timestamps: true })
export class Task implements ITask {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Post' })
  postId?: Types.ObjectId;

  @Prop({ default: '' })
  name?: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: [] })
  userAddress: Array<string>;

  @Prop({})
  taskType: TASK_TYPE;

  @Prop({})
  taskInfo: TaskSnsDto;
}

export type TaskDocument = Task & Document;

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ updatedAt: -1 });
