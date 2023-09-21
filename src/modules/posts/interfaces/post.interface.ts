import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';
import { Task } from 'src/modules/tasks/models/task.model';

export interface IPost {
  _id?: string;
  channelId?: Types.ObjectId | IChannel;
  title?: string;
  content?: string;
  images: Array<string>;
  practicipants: number;
  nftMinted: number;
  tasks?: Task[];
  createdAt?: Date;
  updatedAt?: Date;
}
