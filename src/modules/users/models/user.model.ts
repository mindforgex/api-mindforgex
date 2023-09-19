import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { REGEX_VALIDATOR } from 'src/common/constants';
import {
  Role,
  UserStatus,
  PasswordResetStatus,
  DEFAULT_USER_NONCE,
} from '../constants/user.constant';
import { IUser } from '../interfaces/user.interface';

@Schema({ timestamps: true })
export class User implements IUser {
  @Prop({ lowercase: true, match: REGEX_VALIDATOR.EMAIL, index: true })
  email: string;

  @Prop({ default: '' })
  password?: string;

  @Prop({ default: Role.commonUser, index: true })
  role: Role;

  @Prop({ default: '' })
  userName: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: UserStatus.active })
  status: UserStatus;

  @Prop({ default: new Date() })
  lastConnectedTime: Date;

  @Prop({ default: DEFAULT_USER_NONCE })
  nonce: number;

  @Prop()
  transferredAt: Date;

  @Prop()
  contractAddress: string;

  @Prop()
  collectionName: string;

  @Prop({ default: PasswordResetStatus.confirmed })
  passwordResetStatus: PasswordResetStatus;

  @Prop({ default: '', index: true })
  passwordResetToken: string;

  @Prop({ default: Date.now() })
  passwordResetExpiredAt: number; // Milliseconds

  @Prop({ default: '' })
  googleId?: string;

  @Prop({ default: '' })
  googleDisplayName?: string;

  @Prop({ default: '', index: true })
  twitterId?: string;

  @Prop({ default: '' })
  twitterUsername?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ updatedAt: -1 });
