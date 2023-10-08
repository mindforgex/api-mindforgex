import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IRewardHistory } from '../interfaces/reward.interface';
import { User } from 'src/modules/users/models/user.model';
import { Channel } from 'src/modules/channels/models/channel.model';
import { Reward } from './reward.model';
import { NFTCollection } from 'src/modules/nfts/models/nft-collection.model';
import { STATUS } from '../constants/reward.constant';

@Schema({ timestamps: true })
export class RewardHistory implements IRewardHistory {
  @Prop({ required: true, types: Types.ObjectId, ref: User.name })
  user_id: IRewardHistory['user_id'];

  @Prop({ required: true, types: Types.ObjectId, ref: Channel.name })
  channel_id: IRewardHistory['channel_id'];

  @Prop({ required: true, types: Types.ObjectId, ref: Reward.name })
  reward_id: IRewardHistory['reward_id'];

  @Prop({ required: true, types: Types.ObjectId, ref: NFTCollection.name })
  nft_collection_id: IRewardHistory['nft_collection_id'];

  @Prop({ default: STATUS.PROCESSING })
  status: IRewardHistory['status'];
}

export type RewardHistoryDocument = RewardHistory & Document;

export const RewardHistorySchema = SchemaFactory.createForClass(RewardHistory);

RewardHistorySchema.index({ updatedAt: -1 });
