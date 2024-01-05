import { Types } from 'mongoose';
import { Status } from '../constants/comment.constant';

export interface IComment {
  _id?: string | Types.ObjectId;
  postId?: string | Types.ObjectId;
  userId?: string | Types.ObjectId;
  tagUserId?: string | Types.ObjectId;
  commentParentId?: string | Types.ObjectId;
  status?: Status;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
