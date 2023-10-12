import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';
import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';

import { NFTReceive, NFTReceiveDocument } from '../models/nft-receive.model';
import { WrapperConnection } from 'src/modules/base/services/wrapped-solana-connection.service';
import { ReadApiAsset } from 'src/modules/base/interface/wrapped-solana-connection.type';
import axios from 'axios';

@Injectable()
export class NFTReceiveService extends BaseService<NFTReceiveDocument> {
  constructor(
    @InjectModel(NFTReceive.name)
    private readonly nftReceiveModel: Model<NFTReceiveDocument>,
    private readonly shyftWeb3Service: ShyftWeb3Service,
  ) {
    super(nftReceiveModel);
    this.wrapperConnection = new WrapperConnection(
      process.env.RPC_ENDPOINT,
      'confirmed',
    );
  }

  private wrapperConnection: WrapperConnection;
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

  public getUserNFTByWalletAddress = async (
    walletAddress: string,
  ): Promise<ReadApiAsset[]> => {
    let result = [];
    try {
      // read_all user cNFT by collection
      const { items } = await this.wrapperConnection.getAssetsByOwner({
        ownerAddress: walletAddress,
      });

      result = await Promise.all(
        items
          .filter((_item) => _item.compression.compressed && !_item.burnt)
          .map(async (_item) => {
            const { data } = await axios
              .get(_item.content.json_uri)
              .then((res) => res)
              .catch(() => {
                return { data: {} };
              });
            _item.content.metadata.attributes = data.attributes;
            return _item;
          }),
      );
    } catch (error) {
      this.logger.error(__filename, error);
    }
    return result;
  };
}
