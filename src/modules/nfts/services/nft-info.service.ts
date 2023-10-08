import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import { NFTInfo, NFTInfoDocument } from '../models/nft-info.model';
import { INFTInfo } from '../interfaces/nft-info.interface';

@Injectable()
export class NFTInfoService extends BaseService<NFTInfoDocument> {
  constructor(
    @InjectModel(NFTInfo.name)
    private readonly nftInfoModel: Model<NFTInfoDocument>,
  ) {
    super(nftInfoModel);
  }

  private readonly defaultSelectFields: string = '-_id -channelId';

  public findOneById = (nftInfoId: string, selectFields?: string) =>
    this.nftInfoModel
      .findOne({ _id: nftInfoId }, selectFields ?? this.defaultSelectFields)
      .lean();

  public async createMultiNFTInfos(data: INFTInfo[]) {
    try {
      return await this.nftInfoModel.create(data);
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clearNFTInfos() {
    try {
      // Delete all channels info
      await this.nftInfoModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing channels: ${error.message}`);
    }
  }

  public findByChannelId = (channelId) =>
    this.nftInfoModel.findOne({ channelId }).lean();
}
