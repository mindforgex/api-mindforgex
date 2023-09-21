import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTInfo, NFTMetaData } from '../interfaces/nft_info.interface';

@Schema({ timestamps: true })
export class NFTInfo implements INFTInfo {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel' })
  channelId?: Types.ObjectId;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: 'object', ref: 'NFTMetaData' })
  metaData: NFTMetaData;
}

export type NFTInfoDocument = NFTInfo & Document;

export const NFTInfoSchema = SchemaFactory.createForClass(NFTInfo);

NFTInfoSchema.index({ updatedAt: -1 });
