import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { INFTCollection } from '../interfaces/nft-info.interface';
import { Channel } from 'src/modules/channels/models/channel.model';

@Schema({ timestamps: true })
export class NFTCollection implements INFTCollection {
  @Prop({ default: '' })
  address: INFTCollection['address'];

  @Prop({ default: '' })
  owner_address: INFTCollection['owner_address'];

  @Prop({ required: true, types: Types.ObjectId, ref: Channel.name })
  channel_id: INFTCollection['channel_id'];

  @Prop({ default: '' })
  metadata_uri: INFTCollection['metadata_uri'];
}

export type NFTCollectionDocument = NFTCollection & Document;

export const NFTCollectionSchema = SchemaFactory.createForClass(NFTCollection);

NFTCollectionSchema.index({ updatedAt: -1 });
