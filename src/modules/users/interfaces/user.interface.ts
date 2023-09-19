import { Role } from '../constants/user.constant';

export interface IUser {
  _id?: string;
  email?: string;
  password?: string;
  role: Role;
  userName: string;
  avatarUrl: string;
  status: string;
  lastConnectedTime: Date;
  nonce: number;
  transferredAt: Date;
  twitterId?: string;
  twitterUsername?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
