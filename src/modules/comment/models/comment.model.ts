import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IComment } from '../interfaces/comment.interface';
import { Post } from 'src/modules/posts/models/post.model';
import { User } from 'src/modules/users/models/user.model';
import { Status } from '../constants/comment.constant';

@Schema({ timestamps: true })
export class Comment implements IComment {
  @Prop({ required: true, types: Types.ObjectId, ref: Post.name })
  postId: Types.ObjectId;

  @Prop({ required: true, types: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ required: false, types: Types.ObjectId, ref: User.name })
  tagUserId: Types.ObjectId;

  @Prop({ required: false, types: Types.ObjectId, ref: Comment.name })
  commentParentId: Types.ObjectId;

  @Prop({ default: Status.public })
  status: Status;

  @Prop({ default: '' })
  content: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Comment.name }] })
  childComments: Comment[];
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ updatedAt: -1 });
