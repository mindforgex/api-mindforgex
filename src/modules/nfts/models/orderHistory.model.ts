import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderHistory {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ required: true })
  tx: string;

  @Prop({ required: true })
  buyer: string;
}

export type OrderHistoryDocument = OrderHistory & Document;
export const OrderHistorySchema = SchemaFactory.createForClass(OrderHistory);
OrderHistorySchema.index({ updatedAt: -1 });
