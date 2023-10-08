import { STATUS } from './../constants/reward.constant';
import { Types } from 'mongoose';
import { INFTCollection } from 'src/modules/nfts/interfaces/nft-info.interface';

export interface IReward {
  _id?: string | Types.ObjectId;
  channel_id?: Types.ObjectId; // Reference to the channel who created the reward
  name?: string;
  description?: string;
  amount?: number;
  image_uri?: string;
  nft_collection_id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // extra field
  exchanged_amount?: number; // count RewardHistory
  nft_collection_data?: INFTCollection; // when joining
}

export interface IRewardHistory {
  _id?: string | Types.ObjectId;
  user_id?: Types.ObjectId; // Reference to the user who made the exchange
  channel_id?: Types.ObjectId; // Reference to the channel who created the reward
  reward_id?: Types.ObjectId; // Reference to the reward being exchanged
  nft_collection_id?: Types.ObjectId;
  status?: (typeof STATUS)[keyof typeof STATUS];
  createdAt?: Date;
  updatedAt?: Date;

  // extra field
  nft_collection_data?: INFTCollection; // when joining
  reward_data?: IReward; // when joining
}
