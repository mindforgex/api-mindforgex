import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTCollection } from '../interfaces/nft-info.interface';

@Schema({ timestamps: true })
export class NFTCollection implements INFTCollection {
  @Prop({ default: '', type: String })
  address: INFTCollection['address'];

  @Prop({ default: '', type: String })
  owner_address: INFTCollection['owner_address'];

  @Prop({ required: true, type: Types.ObjectId, ref: 'Channel' })
  channel_id: INFTCollection['channel_id'];

  @Prop({ default: '', type: String })
  metadata_uri: INFTCollection['metadata_uri'];
}

export type NFTCollectionDocument = NFTCollection & Document;

export const NFTCollectionSchema = SchemaFactory.createForClass(NFTCollection);

NFTCollectionSchema.index({ updatedAt: -1 });
