import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  mint: string;

  @Prop({ required: true })
  infoId: Types.ObjectId;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  transaction: string;

  @Prop({ required: true })
  seller: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: 0 })
  status: number;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ updatedAt: -1 });
