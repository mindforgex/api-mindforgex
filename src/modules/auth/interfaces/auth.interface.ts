import { IUser } from 'src/modules/users/interfaces/user.interface';

export type JwtPayload = Pick<
  IUser,
  'twitterUsername' | 'email' | 'role' | 'nonce'
> & {
  userId: string;
};
