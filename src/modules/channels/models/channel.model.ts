import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IChannel, Social, Country } from '../interfaces/channel.interface';
import { Post } from '../../posts/models/post.model';

@Schema({ timestamps: true })
export class Channel implements IChannel {
  @Prop({ default: '' })
  channelName?: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  socialLinks: Social[];

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
  age: string;

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
}

export type ChannelDocument = Channel & Document;

export const ChannelSchema = SchemaFactory.createForClass(Channel);

ChannelSchema.index({ updatedAt: -1 });
