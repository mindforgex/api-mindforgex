import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IVerifyYoutubeInfo } from '../interfaces/verify-youtube-info.interface';

@Schema({ timestamps: true })
export class VerifyYoutubeInfo implements IVerifyYoutubeInfo {
  @Prop({ default: '' })
  sub?: string;

  @Prop({ default: '' })
  userName?: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  picture?: string;

  @Prop({ default: false })
  emailVerified?: boolean;

  @Prop({ default: '' })
  locale?: string;

  @Prop({ type: Object, default: {} })
  tokens: object;

  @Prop({ default: '' })
  walletAddr: string;
}

export type VerifyYoutubeInfoDocument = VerifyYoutubeInfo & Document;

export const VerifyYoutubeInfoSchema = SchemaFactory.createForClass(VerifyYoutubeInfo);

VerifyYoutubeInfoSchema.index({ updatedAt: -1 });
