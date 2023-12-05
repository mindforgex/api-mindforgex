import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  DEFAULT_USER_NONCE,
  Role,
  UserStatus,
} from '../constants/user.constant';
import { IUser } from '../interfaces/user.interface';

@Schema({ timestamps: true })
export class User implements IUser {
  @Prop({ unique: true })
  walletAddress: string;

  @Prop({ default: Role.commonUser, index: true })
  role: Role;

  @Prop()
  avatarUrl: string;

  @Prop({ default: UserStatus.active })
  status: UserStatus;

  @Prop({ default: new Date() })
  lastConnectedTime: Date;

  @Prop({ default: DEFAULT_USER_NONCE })
  nonce: number;

  @Prop()
  hasDiscord: boolean;

  @Prop()
  discordId: string;

  @Prop()
  discordUsername: string;

  @Prop({ unique: true, default: '' })
  registratorToken: string;
  @Prop()
  twitchId: string;

  @Prop()
  twitchLogin: string;

  @Prop()
  twitchAccessToken: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ updatedAt: -1 });

