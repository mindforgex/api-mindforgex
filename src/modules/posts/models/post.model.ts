import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IPost } from '../interfaces/post.interface';

@Schema({ timestamps: true })
export class Post implements IPost {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel'})
  channelId?: Types.ObjectId;

  @Prop({ default: '' })
  content?: string;

  @Prop({ default: [] })
  images: Array<string>;
}

export type PostDocument = Post & Document;

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ updatedAt: -1 });
