import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTReceive } from '../interfaces/nft-receive.interface';

@Schema({ timestamps: true })
export class NFTReceive implements INFTReceive {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel' })
  channelId?: Types.ObjectId;

  @Prop({ default: '' })
  nftAddress: string;

  @Prop({ default: '' })
  userAddress: string;

  @Prop({ default: new Date() })
  mintTime: Date;
}

export type NFTReceiveDocument = NFTReceive & Document;

export const NFTReceiveSchema = SchemaFactory.createForClass(NFTReceive);

NFTReceiveSchema.index({ updatedAt: -1 });
