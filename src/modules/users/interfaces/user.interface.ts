import { Role } from '../constants/user.constant';

export interface IUser {
  _id?: string;
  walletAddress: string;
  role: Role;
  avatarUrl: string;
  status: string;
  lastConnectedTime: Date;
  nonce: number;
  createdAt?: Date;
  updatedAt?: Date;
}
