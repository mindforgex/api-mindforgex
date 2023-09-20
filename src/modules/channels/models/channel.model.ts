import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IChannel } from '../interfaces/channel.interface';
import { Post } from '../../posts/models/post.model';

@Schema({ timestamps: true })
export class Channel implements IChannel {
  @Prop({ default: '' })
  channelName?: string;

  @Prop({ default: '' })
  avatarUrls: string;

  @Prop({ default: '' })
  backgroundUrls: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  followers: number;

  @Prop({ default: '' })
  socialLinks: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Post.name }] })
  posts: Post[];
}

export type ChannelDocument = Channel & Document;

export const ChannelSchema = SchemaFactory.createForClass(Channel);

ChannelSchema.index({ updatedAt: -1 });
