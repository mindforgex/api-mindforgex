import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';

export interface IPost {
  _id?: string;
  channelId?: Types.ObjectId | IChannel;
  content?: string;
  images: Array<string>;
  tasks: Array<{
    type: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}
