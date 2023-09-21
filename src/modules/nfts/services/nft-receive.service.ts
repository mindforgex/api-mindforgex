import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { ClientSession, Model } from 'mongoose';

  import {
    SORT_CONDITION,
  } from '../constants/nft.constant';

  import { BaseService } from 'src/modules/base/services/base.service';

  import { NFTReceive, NFTReceiveDocument } from '../models/nft-receive.model';

  @Injectable()
  export class NFTReceiveService extends BaseService<NFTReceiveDocument> {
    constructor(
      @InjectModel(NFTReceive.name)
      private readonly nftReceiveModel: Model<NFTReceiveDocument>,
    ) {
      super(nftReceiveModel);
    }
    private readonly defaultSelectFields: string = '-_id -channelId';

    public findOneByChannelId = (channelId: string, selectFields?: string) =>
    this.nftReceiveModel
      .findOne({ channelId: channelId }, selectFields ?? this.defaultSelectFields)
      .lean();

    public findOneById = (nftReceiveId: string, selectFields?: string) =>
    this.nftReceiveModel
      .findOne({ _id: nftReceiveId }, selectFields ?? this.defaultSelectFields)
      .lean();

    public async createNFTReceive(channelId: string, dataArray: any[]) {
      try {
        return await this.nftReceiveModel.create(dataArray.map((data) => ({ ...data, channel: channelId })));
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
  }
