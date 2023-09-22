import { Post } from 'src/modules/posts/models/post.model';
import { NFTInfo } from 'src/modules/nfts/models/nft-info.model';

export interface Social {
  url: string;
  name: string;
  icon: string;
}
export interface Country {
  name: string;
  icon: string;
}
export interface IChannel {
  _id?: string;
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
  sex: string;
  dateOfBirth: string;
  twitterUrl: string;
  youtubeUrl: string;
  follower: number;
  followerYoutube: number;
  followerTwitter: number;
  posts?: Post[];
  nftInfos?: NFTInfo[];
  userSubcribe: Array<string>;
  aboutMe: string;
  createdAt?: Date;
  updatedAt?: Date;
}
