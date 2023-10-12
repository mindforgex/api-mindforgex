import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/modules/base/services/base.service';
import { OrderHistory, OrderHistoryDocument } from '../models/orderHistory.model';
import { IUser } from 'src/modules/users/interfaces/user.interface';

@Injectable()
export class OrderHistoryService extends BaseService<OrderHistoryDocument> {
  constructor(
    @InjectModel(OrderHistory.name)
    private readonly orderHistoryModel: Model<OrderHistoryDocument>
  ) {
    super(orderHistoryModel);
  }

  async createOrderHistory(params: any, user: IUser) {
    const historyParams = {...params, buyer: user.walletAddress};
    try {
      return await this.orderHistoryModel.create([historyParams]);
    } catch (error) {
      throw new Error(`Error creating order History: ${error.message}`);
    }
  }

  async findOneByTx(tx: string) {
    return await this.orderHistoryModel.findOne({ tx }).lean();
  }
}
