import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserNoti {
  @Prop({ required: true, types: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, types: Types.ObjectId, ref: 'Notification' })
  notiId: Types.ObjectId;
}
export type UserNotiDocument = UserNoti & Document;
export const UserNotiSchema = SchemaFactory.createForClass(UserNoti);
UserNotiSchema.index({ updatedAt: -1 });
