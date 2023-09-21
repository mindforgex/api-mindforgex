import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTInfo, NFTProperty } from '../interfaces/nft_info.interface';

@Schema({ timestamps: true })
export class NFTInfo implements INFTInfo {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel' })
  channelId?: Types.ObjectId;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  symbol: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  seller_fee_basis_points: number;

  @Prop({ default: '' })
  external_url: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  attributes: Array<string>;

  @Prop({ type: 'object', ref: 'NFTProperty' })
  properties: NFTProperty;
}

export type NFTInfoDocument = NFTInfo & Document;

export const NFTInfoSchema = SchemaFactory.createForClass(NFTInfo);

NFTInfoSchema.index({ updatedAt: -1 });
