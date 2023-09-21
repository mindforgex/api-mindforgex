import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IChannel, Social, Country } from '../interfaces/channel.interface';
import { Post } from '../../posts/models/post.model';
import { NFTInfo } from '../../nfts/models/nft-info.model';

@Schema({ timestamps: true })
export class Channel implements IChannel {
  @Prop({ default: '' })
  name?: string;

  @Prop({ default: '' })
  channelName?: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  socialLinks: Social[];

  @Prop({ type: 'object', ref: 'Country' })
  country: Country;

  @Prop({ default: '' })
  founder: string;

  @Prop({ default: '' })
  mainGame: string;

  @Prop({ default: '' })
  profestionalFeild: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  sex: string;

  @Prop({ default: '' })
  dateOfBirth: string;

  @Prop({ default: '' })
  twitterUrl: string;

  @Prop({ default: '' })
  youtubeUrl: string;

  @Prop({ default: '' })
  follwerYoutube: number;

  @Prop({ default: '' })
  follwerTwitter: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: Post.name }] })
  posts: Post[];

  @Prop({ type: [{ type: Types.ObjectId, ref: NFTInfo.name }] })
  nftInfos: NFTInfo[];
}

export type ChannelDocument = Channel & Document;

export const ChannelSchema = SchemaFactory.createForClass(Channel);

ChannelSchema.index({ updatedAt: -1 });
