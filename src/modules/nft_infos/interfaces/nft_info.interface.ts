import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';

export interface NFTMetaData {
  name: string;
  symbol: string;
  image: string;
  description: string;
  attributes: Array<string>;
  royalty: number;
  creator: string;
  share: number;
  external_url: string;
  files: Array<string>;
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
