import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import { Reward, RewardDocument } from '../models/reward.model';
import { IReward } from '../interfaces/reward.interface';

@Injectable()
export class RewardService extends BaseService<RewardDocument> {
  constructor(
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {
    super(rewardModel);
  }

  private readonly defaultSelectFields: string =
    '-_id -channel_id -nft_collection_id';

  public findOneById = (nftCollectionId: string, selectFields?: string) =>
    this.rewardModel
      .findOne(
        { _id: nftCollectionId },
        selectFields ?? this.defaultSelectFields,
      )
      .lean();

  public async createMany(data: IReward[]) {
    try {
      return await this.rewardModel.create(data);
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clear() {
    try {
      // Delete all
      await this.rewardModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing ${Reward.name}: ${error.message}`);
    }
  }
}
