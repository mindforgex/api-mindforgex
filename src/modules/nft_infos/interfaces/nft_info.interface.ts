import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';

export interface NFTMetaData {
  name: string;
  image: string;
  externalUrl: string;
  attributes: Array<string>;
}

export interface INFTInfo {
  _id?: string;
  channelId?: Types.ObjectId | IChannel;
  name: string;
  image: string;
  description: string;
  metaData: NFTMetaData;
  createdAt?: Date;
  updatedAt?: Date;
}
