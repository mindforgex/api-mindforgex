import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IPost } from '../interfaces/post.interface';
import { Task } from 'src/modules/tasks/models/task.model';
import { NFTInfo } from 'src/modules/nfts/models/nft-info.model';

@Schema({ timestamps: true })
export class Post implements IPost {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel' })
  channelId?: Types.ObjectId;

  @Prop({ default: '' })
  title?: string;

  @Prop({ default: '' })
  content?: string;

  @Prop({ default: [] })
  images: Array<string>;

  @Prop({ default: '' })
  practicipants: number;

  @Prop({ default: '' })
  nftMinted: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: Task.name }] })
  tasks: Task[];

  @Prop({ required: true, types: Types.ObjectId, ref: NFTInfo.name })
  nftId: Types.ObjectId;
}

export type PostDocument = Post & Document;

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ updatedAt: -1 });
