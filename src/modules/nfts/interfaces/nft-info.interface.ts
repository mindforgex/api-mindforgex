import { Types } from 'mongoose';
import { IChannel } from 'src/modules/channels/interfaces/channel.interface';

export interface NFTProperty {
  creators: Array<string>,
  files: Array<string>,
}

export interface INFTInfo {
  _id?: string;
  channelId?: Types.ObjectId | IChannel;
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  external_url: string;
  image: string;
  attributes: Array<string>;
  properties: NFTProperty;
  createdAt?: Date;
  updatedAt?: Date;
}
