import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ISchedule } from '../interfaces/schedule.interface';

@Schema({ timestamps: true })
export class Schedule implements ISchedule {
  @Prop({ required: true, types: Types.ObjectId, ref: 'Channel' })
  channelId: Types.ObjectId;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  cover: string;

  @Prop({ default: '' })
  date: Date;
}

export type ScheduleDocument = Schedule & Document;

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ updatedAt: -1 });
