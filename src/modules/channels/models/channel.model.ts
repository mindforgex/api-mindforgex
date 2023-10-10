import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IChannel, Social, Country } from '../interfaces/channel.interface';
import { Post } from '../../posts/models/post.model';
import { NFTCollection } from 'src/modules/nfts/models/nft-collection.model';

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
  founded: string;

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
  follower: number;

  @Prop({ default: '' })
  followerYoutube: number;

  @Prop({ default: '' })
  followerTwitter: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: Post.name }] })
  posts: Post[];

  @Prop({ type: [{ type: Types.ObjectId, ref: NFTCollection.name }] })
  nftCollections: NFTCollection[];

  @Prop({ default: [] })
  userSubcribe: Array<string>;

  @Prop({ default: '' })
  aboutMe: string;
}

export type ChannelDocument = Channel & Document;

export const ChannelSchema = SchemaFactory.createForClass(Channel);

ChannelSchema.index({ updatedAt: -1 });
