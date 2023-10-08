import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import {
  RewardHistory,
  RewardHistoryDocument,
} from '../models/reward-history.model';
import { IRewardHistory } from '../interfaces/reward.interface';
import { Reward } from '../models/reward.model';
import { NFTCollection } from 'src/modules/nfts/models/nft-collection.model';

@Injectable()
export class RewardHistoryService extends BaseService<RewardHistoryDocument> {
  constructor(
    @InjectModel(RewardHistory.name)
    private readonly rewardHistoryModel: Model<RewardHistoryDocument>,
  ) {
    super(rewardHistoryModel);
  }

  private readonly defaultSelectFields: string =
    '-_id -user_id -channel_id -reward_id -nft_collection_id';

  public findOne = (query: IRewardHistory, selectFields?: string) =>
    this.rewardHistoryModel
      .findOne(query, selectFields ?? this.defaultSelectFields)
      .lean();

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
          },
        },
        {
          $lookup: {
            from: Reward.name, // The name of the "reward" collection
            localField: 'reward_id',
            foreignField: '_id',
            as: 'reward_data',
          },
        },
        {
          $lookup: {
            from: NFTCollection.name, // The name of the "nft_collection" collection
            localField: 'nft_collection_id',
            foreignField: '_id',
            as: 'nft_collection_data',
          },
        },
      ])
      .exec() as unknown as Promise<IRewardHistory[]>;
}
