import { Types } from 'mongoose';

export interface ISchedule {
  _id?: string | Types.ObjectId;
  channelId?: string | Types.ObjectId;
  title?: string;
  description?: string;
  cover?: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
