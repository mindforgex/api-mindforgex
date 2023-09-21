import { IUser } from 'src/modules/users/interfaces/user.interface';

export type JwtPayload = Pick<IUser, 'walletAddress' | 'role' | 'nonce'> & {
  userId: string;
};
