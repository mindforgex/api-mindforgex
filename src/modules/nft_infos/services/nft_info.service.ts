import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import {
  SORT_CONDITION,
} from '../constants/nft_info.constant';

import { BaseService } from 'src/modules/base/services/base.service';

import { NFTInfo, NFTInfoDocument } from '../models/nft_info.model';

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

  public async createMultiNFTInfos(channelId: string, dataArray: any[]) {
    try {
      return await this.nftInfoModel.create(dataArray.map((data) => ({ ...data, channel: channelId })));
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
}
