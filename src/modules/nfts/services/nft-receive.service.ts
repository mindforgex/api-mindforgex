import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';
import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';

import { NFTReceive, NFTReceiveDocument } from '../models/nft-receive.model';

@Injectable()
export class NFTReceiveService extends BaseService<NFTReceiveDocument> {
  constructor(
    @InjectModel(NFTReceive.name)
    private readonly nftReceiveModel: Model<NFTReceiveDocument>,
    private readonly shyftWeb3Service: ShyftWeb3Service,
  ) {
    super(nftReceiveModel);
  }
  private readonly defaultSelectFields: string = '-_id -channelId';

  public findOneByChannelId = (channelId: string, selectFields?: string) =>
    this.nftReceiveModel
      .findOne(
        { channelId: channelId },
        selectFields ?? this.defaultSelectFields,
      )
      .lean();

  public findOneById = (nftReceiveId: string, selectFields?: string) =>
    this.nftReceiveModel
      .findOne({ _id: nftReceiveId }, selectFields ?? this.defaultSelectFields)
      .lean();

  public async createNFTReceive(channelId: string, dataArray: any[]) {
    try {
      return await this.nftReceiveModel.create(
        dataArray.map((data) => ({ ...data, channel: channelId })),
      );
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clearNFTInfos() {
    try {
      // Delete all channels info
      await this.nftReceiveModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing channels: ${error.message}`);
    }
  }

  public async getNFTByUser(walletAddress: string) {
    return this.shyftWeb3Service.getCNFTByWalletAddress(walletAddress);
  }
}
