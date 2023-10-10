import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IReward } from '../interfaces/reward.interface';

@Schema({ timestamps: true })
export class Reward implements IReward {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Channel' })
  channel_id: IReward['channel_id'];

  @Prop({ default: '', type: String })
  name: IReward['name'];

  @Prop({ default: '', type: String })
  description: IReward['description'];

  @Prop({ default: '', type: String })
  image_uri: IReward['image_uri'];

  @Prop({ default: 0, type: Number })
  amount: IReward['amount'];

  @Prop({ required: true, type: String, ref: 'NFTCollection' })
  nft_collection_address: IReward['nft_collection_address'];
}

export type RewardDocument = Reward & Document;

export const RewardSchema = SchemaFactory.createForClass(Reward);

RewardSchema.index({ updatedAt: -1 });
