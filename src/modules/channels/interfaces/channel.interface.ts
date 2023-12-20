import { Post } from 'src/modules/posts/models/post.model';
import { NFTInfo } from 'src/modules/nfts/models/nft-info.model';
import { Donate } from 'src/modules/donates/models/donate.model';
import { Types } from 'mongoose';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export interface Social {
  url: string;
  name: string;
  icon: string;
  totalFollower: number;
}
export interface Country {
  name: string;
  icon: string;
}
export enum Sex {
  male = 'male',
  female = 'female',
  other = 'other',
}
export interface IChannel {
  _id?: string;
  userId?: Types.ObjectId | IUser;
  name?: string;
  channelName?: string;
  avatarUrl: string;
  description: string;
  socialLinks: Social[];
  country: Country;
  founded: string;
  mainGame: string;
  profestionalFeild: string;
  email: string;
  sex: Sex;
  dateOfBirth: string;
  // twitterUrl: string;
  // youtubeUrl: string;
  follower: number;
  followerYoutube: number;
  followerTwitter: number;
  posts?: Post[];
  nftInfos?: NFTInfo[];
  userSubcribe: Array<string>;
  aboutMe: string;
  donateReceiver: string;
  donates?: Donate[];
  amountDonate: number;
  createdAt?: Date;
  updatedAt?: Date;
}
