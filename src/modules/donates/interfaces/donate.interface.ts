import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';

export interface IDonate {
  _id?: string;
  channelId?: Types.ObjectId | IChannel;
  userWallet: string;
  channelWallet: string;
  amount: number;
  dateTimeDonate: Date;
  transactionHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}
