import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTInfo } from '../interfaces/nft-info.interface';

@Schema({ timestamps: true })
export class NFTInfo implements INFTInfo {
  [key: string]: unknown;

  @Prop({ default: '', type: 'string' })
  name: INFTInfo['name'];

  @Prop({ default: '', type: 'string' })
  symbol: INFTInfo['symbol'];

  @Prop({ default: '', type: 'string' })
  description: INFTInfo['description'];

  @Prop({ default: 0, type: 'number' })
  seller_fee_basis_points: INFTInfo['seller_fee_basis_points'];

  @Prop({ default: '', type: 'string' })
  image: INFTInfo['image'];

  @Prop({ default: '', type: 'string' })
  animation_url: INFTInfo['animation_url'];

  @Prop({ default: '', type: 'string' })
  external_url: INFTInfo['external_url'];

  @Prop({ required: true, type: 'string', ref: 'NFTCollection' })
  nft_collection_address: INFTInfo['nft_collection_address'];

  @Prop({ default: [], type: Types.Array })
  attributes: INFTInfo['attributes'];

  @Prop({ default: { creators: [], files: [] }, type: Types.Array })
  properties: INFTInfo['properties'];

  @Prop({ default: {}, type: 'object' })
  collection: INFTInfo['collection'];
}

export type NFTInfoDocument = NFTInfo & Document;

export const NFTInfoSchema = SchemaFactory.createForClass(NFTInfo);

NFTInfoSchema.index({ updatedAt: -1 });
