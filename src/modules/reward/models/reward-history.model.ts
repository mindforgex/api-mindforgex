import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IRewardHistory } from '../interfaces/reward.interface';
import { STATUS } from '../constants/reward.constant';

@Schema({ timestamps: true })
export class RewardHistory implements IRewardHistory {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: IRewardHistory['user_id'];

  @Prop({ required: true, type: Types.ObjectId, ref: 'Channel' })
  channel_id: IRewardHistory['channel_id'];

  @Prop({ required: true, type: Types.ObjectId, ref: 'Reward' })
  reward_id: IRewardHistory['reward_id'];

  @Prop({ required: true, type: Types.ObjectId, ref: 'NFTCollection' })
  nft_collection_id: IRewardHistory['nft_collection_id'];

  @Prop({ default: STATUS.PROCESSING, type: 'string' })
  status: IRewardHistory['status'];
}

export type RewardHistoryDocument = RewardHistory & Document;

export const RewardHistorySchema = SchemaFactory.createForClass(RewardHistory);

RewardHistorySchema.index({ updatedAt: -1 });
