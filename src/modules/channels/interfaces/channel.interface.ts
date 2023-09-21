import { Post } from 'src/modules/posts/models/post.model';
import { NFTInfo } from 'src/modules/nft_infos/models/nft_info.model';

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
  founder: string;
  mainGame: string;
  profestionalFeild: string;
  email: string;
  sex: string;
  dateOfBirth: string;
  twitterUrl: string;
  youtubeUrl: string;
  follwerYoutube: number;
  follwerTwitter: number;
  posts?: Post[];
  nftInfos?: NFTInfo[];
  createdAt?: Date;
  updatedAt?: Date;
}
