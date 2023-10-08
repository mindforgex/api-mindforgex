import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IReward } from '../interfaces/reward.interface';
import { Channel } from 'src/modules/channels/models/channel.model';
import { NFTCollection } from 'src/modules/nfts/models/nft-collection.model';

@Schema({ timestamps: true })
export class Reward implements IReward {
  @Prop({ required: true, types: Types.ObjectId, ref: Channel.name })
  channel_id: IReward['channel_id'];

  @Prop({ default: '' })
  name: IReward['name'];

  @Prop({ default: '' })
  description: IReward['description'];

  @Prop({ default: '' })
  image_uri: IReward['image_uri'];

  @Prop({ default: 0 })
  amount: IReward['amount'];

  @Prop({ required: true, types: Types.ObjectId, ref: NFTCollection.name })
  nft_collection_id: IReward['nft_collection_id'];
}

export type RewardDocument = Reward & Document;

export const RewardSchema = SchemaFactory.createForClass(Reward);

RewardSchema.index({ updatedAt: -1 });
