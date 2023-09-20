import { Post } from 'src/modules/posts/models/post.model';

export interface IChannel {
  _id?: string;
  channelName?: string;
  avatarUrls: string;
  backgroundUrls: string;
  description: string;
  posts?: Post[];
  createdAt?: Date;
  updatedAt?: Date;
}
