import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { INFTInfo } from '../interfaces/nft-info.interface';
import { NFTCollection } from './nft-collection.model';

@Schema({ timestamps: true })
export class NFTInfo implements INFTInfo {
  [key: string]: unknown;

  @Prop({ default: '' })
  name: INFTInfo['name'];

  @Prop({ default: '' })
  symbol: INFTInfo['symbol'];

  @Prop({ default: '' })
  description: INFTInfo['description'];

  @Prop({ default: 0 })
  seller_fee_basis_points: INFTInfo['seller_fee_basis_points'];

  @Prop({ default: '' })
  image: INFTInfo['image'];

  @Prop({ default: '' })
  animation_url: INFTInfo['animation_url'];

  @Prop({ default: '' })
  external_url: INFTInfo['external_url'];

  @Prop({ required: true, types: 'string', ref: NFTCollection.name })
  nft_collection_address: INFTInfo['nft_collection_address'];

  @Prop({ default: [] })
  attributes: INFTInfo['attributes'];

  @Prop({ default: { creators: [], files: [] } })
  properties: INFTInfo['properties'];

  @Prop({ default: {} })
  collection: INFTInfo['collection'];
}

export type NFTInfoDocument = NFTInfo & Document;

export const NFTInfoSchema = SchemaFactory.createForClass(NFTInfo);

NFTInfoSchema.index({ updatedAt: -1 });
