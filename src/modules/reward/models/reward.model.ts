import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IReward } from '../interfaces/reward.interface';
import { Channel } from 'src/modules/channels/models/channel.model';
import { NFTCollection } from 'src/modules/nfts/models/nft-collection.model';

@Schema({ timestamps: true })
export class Reward implements IReward {
  @Prop({ required: true, type: Types.ObjectId, ref: Channel.name })
  channel_id: IReward['channel_id'];

  @Prop({ default: '', type: 'string' })
  name: IReward['name'];

  @Prop({ default: '', type: 'string' })
  description: IReward['description'];

  @Prop({ default: '', type: 'string' })
  image_uri: IReward['image_uri'];

  @Prop({ default: 0, type: 'number' })
  amount: IReward['amount'];

  @Prop({ required: true, type: Types.ObjectId, ref: NFTCollection.name })
  nft_collection_id: IReward['nft_collection_id'];
}

export type RewardDocument = Reward & Document;

export const RewardSchema = SchemaFactory.createForClass(Reward);

RewardSchema.index({ updatedAt: -1 });
