export interface IVerifyYoutubeInfo {
  _id?: string;
  sub?: string;
  userName?: string,
  email: string;
  picture?: string;
  emailVerified?: boolean;
  locale?: string;
  tokens?: object;
  walletAddr: string;
  createdAt?: Date;
  updatedAt?: Date;
}
