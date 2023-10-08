import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTInfo } from '../interfaces/nft-info.interface';

@Schema({ timestamps: true })
export class NFTInfo implements INFTInfo {
  @Prop({ default: '', type: String })
  name: INFTInfo['name'];

  @Prop({ default: '', type: String })
  symbol: INFTInfo['symbol'];

  @Prop({ default: '', type: String })
  description: INFTInfo['description'];

  @Prop({ default: 0, type: Number })
  seller_fee_basis_points: INFTInfo['seller_fee_basis_points'];

  @Prop({ default: '', type: String })
  image: INFTInfo['image'];

  @Prop({ default: '', type: String })
  animation_url: INFTInfo['animation_url'];

  @Prop({ default: '', type: String })
  external_url: INFTInfo['external_url'];

  @Prop({ required: true, default: '', type: String, ref: 'NFTCollection' })
  nft_collection_address: INFTInfo['nft_collection_address'];

  @Prop({ default: [], type: Types.Array })
  attributes: INFTInfo['attributes'];

  @Prop({ default: {}, type: Object })
  properties: INFTInfo['properties'];
}

export type NFTInfoDocument = NFTInfo & Document;

export const NFTInfoSchema = SchemaFactory.createForClass(NFTInfo);

NFTInfoSchema.index({ updatedAt: -1 });
