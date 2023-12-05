import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  content: string;
}
export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ updatedAt: -1 });
