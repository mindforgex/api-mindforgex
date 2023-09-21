import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';

export interface INFTReceive {
  _id?: string;
  channelId?: Types.ObjectId | IChannel;
  nftAddress: string;
  userAddress: string;
  mintTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
