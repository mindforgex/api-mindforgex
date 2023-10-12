import { Types } from 'mongoose';
import { JsonMetadata } from 'src/modules/base/interface/wrapped-solana-connection.type';
import {
  IReward,
  IRewardHistory,
} from 'src/modules/reward/interfaces/reward.interface';

type _id = string | Types.ObjectId;
export interface INFTInfo extends JsonMetadata {
  _id?: _id;
  nft_collection_address?: string;

  // extra field
  owned?: boolean; // extra field when user get collection item
  order?: object | null;
  amount?: number;
}

export interface INFTCollection {
  _id?: _id;
  address?: string;
  owner_address?: string;
  channel_id?: Types.ObjectId;
  metadata_uri?: string;

  // extra field
  nft_info?: Array<INFTInfo>; // when joining
  reward_data?: Array<IReward>;
  reward_history_data?: Array<IRewardHistory>;
}
