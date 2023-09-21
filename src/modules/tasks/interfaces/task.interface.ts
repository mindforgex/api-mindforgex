import { Types } from 'mongoose';
import { IPost } from 'src/modules/posts/interfaces/post.interface';

export interface ITask {
  _id?: string;
  postId?: Types.ObjectId | IPost;
  name?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
