import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import {
  RewardHistory,
  RewardHistoryDocument,
} from '../models/reward-history.model';
import { IRewardHistory } from '../interfaces/reward.interface';
import { STATUS } from '../constants/reward.constant';

@Injectable()
export class RewardHistoryService extends BaseService<RewardHistoryDocument> {
  constructor(
    @InjectModel(RewardHistory.name)
    private readonly rewardHistoryModel: Model<RewardHistoryDocument>,
  ) {
    super(rewardHistoryModel);
  }

  public findOne = (query: IRewardHistory) =>
    this.rewardHistoryModel.findOne(query).lean();

  public findOneAndUpdate = (query: IRewardHistory, update: IRewardHistory) =>
    this.rewardHistoryModel.findOneAndUpdate(query, update).lean();

  public async createMany(data: IRewardHistory[]) {
    try {
      return await this.rewardHistoryModel.create(data);
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clear() {
    try {
      // Delete all info
      await this.rewardHistoryModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing: ${error.message}`);
    }
  }

  public findByUserId = (userId: string): Promise<IRewardHistory[]> =>
    this.rewardHistoryModel
      .aggregate([
        {
          $match: {
            user_id: new Types.ObjectId(userId),
            status: STATUS.COMPLETED,
          },
        },
        {
          $lookup: {
            from: 'rewards',
            localField: 'reward_id',
            foreignField: '_id',
            as: 'reward_data',
          },
        },
        // {
        //   $lookup: {
        //     from: 'nftcollections',
        //     localField: 'nft_collection_address',
        //     foreignField: 'address',
        //     as: 'nft_collection_data',
        //   },
        // },
      ])
      .exec() as unknown as Promise<IRewardHistory[]>;
}
