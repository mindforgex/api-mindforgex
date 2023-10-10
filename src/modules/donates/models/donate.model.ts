import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IDonate } from '../interfaces/donate.interface';

@Schema({ timestamps: true })
export class Donate implements IDonate {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel' })
  channelId?: Types.ObjectId;

  @Prop({ default: '' })
  userWallet: string;

  @Prop({ default: '' })
  channelWallet: string;

  @Prop({ default: '' })
  amount: number;

  @Prop({ default: new Date() })
  dateTimeDonate: Date;

  @Prop({ default: '' })
  transactionHash: string;;
}

export type DonateDocument = Donate & Document;

export const DonateSchema = SchemaFactory.createForClass(Donate);

DonateSchema.index({ updatedAt: -1 });
