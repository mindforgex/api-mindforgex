/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import {
  NFTCollection,
  NFTCollectionDocument,
} from '../models/nft-collection.model';
import { INFTCollection } from '../interfaces/nft-info.interface';
import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { WrapperConnection } from 'src/modules/base/services/wrapped-solana-connection.service';
import { ICreateNFTCollectionForm } from 'src/modules/base/interface/shyft-web3.type';
import { ReadApiAsset } from 'src/modules/base/interface/wrapped-solana-connection.type';
import { ChannelService } from 'src/modules/channels/services/channel.service';
import {
  ConfirmExchangeCollectionDto,
  RequestExchangeCollectionDto,
} from '../dtos/request.dto';
import { RequestExchangeCollectionResponseDto } from '../dtos/response.dto';
import { RewardHistoryService } from 'src/modules/reward/services/reward-history.service';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { STATUS } from 'src/modules/reward/constants/reward.constant';

import { ParsedTransactionWithMeta } from '@solana/web3.js';

@Injectable()
export class NFTCollectionService extends BaseService<NFTCollectionDocument> {
  constructor(
    @InjectModel(NFTCollection.name)
    private readonly nftCollectionModel: Model<NFTCollectionDocument>,
    private readonly shyftWeb3Service: ShyftWeb3Service,
    private readonly channelService: ChannelService,
    private readonly rewardHistoryService: RewardHistoryService,
  ) {
    super(nftCollectionModel);
    this.wrapperConnection = new WrapperConnection(
      process.env.RPC_ENDPOINT,
      'confirmed',
    );
  }

  private readonly defaultSelectFields: string = '-_id -channel_id -address';
  private wrapperConnection: WrapperConnection;

  public findOneById = (nftCollectionId: string, selectFields?: string) =>
    this.nftCollectionModel
      .findOne(
        { _id: nftCollectionId },
        selectFields ?? this.defaultSelectFields,
      )
      .lean();

  // save metadata
  public async insertMany(data: INFTCollection[]) {
    try {
      return await this.nftCollectionModel.create(data);
    } catch (error) {
      throw new Error(`Error creating ${NFTCollection.name}: ${error.message}`);
    }
  }

  // mint and save metadata
  public async createMany(data: ICreateNFTCollectionForm[], channelId: string) {
    try {
      // Shyft free plan allows 1 request per second
      const _formatData = [];
      for (const _data of data) {
        // TODO: fix this
        // const channelData = await this.channelService.findOneById(channelId);
        // _data.receiver = channelData.walletAddress;
        const resp = await this.shyftWeb3Service.mintCollectionNFT(_data);
        const collectionData =
          await this.shyftWeb3Service.getCollectionByAddress(resp.address);
        _formatData.push({
          address: collectionData.mint,
          owner_address: collectionData.owner,
          metadata_uri: collectionData.metadata_uri,
          channel_id: channelId,
        });
      }
      return await this.nftCollectionModel.create(_formatData);
    } catch (error) {
      throw new Error(`Error creating ${NFTCollection.name}: ${error.message}`);
    }
  }

  public async clear() {
    try {
      // Delete all
      await this.nftCollectionModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing ${NFTCollection.name}: ${error.message}`);
    }
  }

  public getUserNFTByCollection = async (
    collectionAddress: string,
    walletAddress: string,
  ): Promise<ReadApiAsset[]> => {
    let result = [];
    try {
      const { items } = await this.wrapperConnection.getAssetsByGroup({
        groupKey: 'collection',
        groupValue: collectionAddress,
        sortBy: {
          sortBy: 'recent_action',
          sortDirection: 'asc',
        },
      });

      result = items.filter((_item) => _item.ownership.owner === walletAddress);
    } catch (error) {
      this.logger.error(__filename, error.message);
    }

    return result;
  };

  public checkOwnedByWalletAddress = (
    collectionData: INFTCollection,
    userNFTData: ReadApiAsset[],
  ) => {
    try {
      if (
        !Array.isArray(collectionData.nft_info) ||
        collectionData.nft_info.length === 0
      ) {
        return;
      }

      // filter index and optimize data
      const itemIndexes = userNFTData.flatMap(
        (_item) =>
          Array.isArray(_item.content.metadata.attributes) &&
          _item.content.metadata.attributes
            .filter((_itemAttribute) => _itemAttribute.trait_type === 'index')
            .map((_itemAttribute) => _itemAttribute.value),
      );

      // check owned
      for (const _collectionItems of collectionData.nft_info) {
        _collectionItems.owned = _collectionItems.attributes.some(
          (_collectionAttribute) =>
            _collectionAttribute.trait_type === 'index' &&
            itemIndexes.includes(_collectionAttribute.value),
        );
      }
    } catch (error) {
      this.logger.error(__filename, error);
    }
  };

  public find = (query: INFTCollection | any): Promise<INFTCollection[]> =>
    this.nftCollectionModel
      .aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'nftinfos',
            localField: 'address',
            foreignField: 'nft_collection_address',
            as: 'nft_info',
          },
        },
        {
          $lookup: {
            from: 'rewards',
            localField: '_id',
            foreignField: 'nft_collection_id',
            as: 'reward_data',
          },
        },
        {
          $lookup: {
            from: 'rewardhistories',
            localField: 'reward_data._id',
            foreignField: 'reward_id',
            as: 'reward_history',
          },
        },
        {
          $group: {
            _id: '$_id',
            address: { $first: '$address' },
            owner_address: { $first: '$owner_address' },
            channel_id: { $first: '$channel_id' },
            metadata_uri: { $first: '$metadata_uri' },
            nft_info: { $first: '$nft_info' },
            rewards: {
              $push: {
                $mergeObjects: [
                  { $arrayElemAt: ['$reward_data', 0] },
                  { exchanged_amount: { $sum: { $size: '$reward_history' } } },
                ],
              },
            },
          },
        },
      ])
      .exec() as unknown as Promise<INFTCollection[]>;

  public requestExchangeCollection = async (
    payload: RequestExchangeCollectionDto,
    userParam: IUser,
  ): Promise<RequestExchangeCollectionResponseDto> => {
    try {
      let collectionData: INFTCollection | Array<INFTCollection>;
      collectionData = await this.find({
        _id: new Types.ObjectId(payload.collectionId),
        channel_id: new Types.ObjectId(payload.channelId),
      });
      if (collectionData.length === 0) {
        this.logger.error('No NFT collection found');
        return;
      }
      collectionData = collectionData[0];

      const userNFTByCollection = await this.getUserNFTByCollection(
        collectionData.address,
        userParam.walletAddress,
      );
      this.checkOwnedByWalletAddress(collectionData, userNFTByCollection);

      const isUserOwnedAllNFT = collectionData.nft_info.some(
        (_item) => !_item.owned,
      );
      if (isUserOwnedAllNFT) {
        this.logger.error("User hasn't owned all NFT");
        return;
      }

      // insert reward_history with status "processing"
      const insertRewardHistoryResp =
        await this.rewardHistoryService.createMany([
          {
            user_id: new Types.ObjectId(userParam._id),
            channel_id: new Types.ObjectId(payload.channelId),
            reward_id: new Types.ObjectId(collectionData.reward_data._id),
            nft_collection_id: new Types.ObjectId(collectionData._id),
            status: STATUS.PROCESSING,
          },
        ]);
      // get burn many compressed nft transaction encoded from Shyft
      const encodedTransactions = await this.shyftWeb3Service.burnMany(
        userNFTByCollection.map((_nft) => _nft.id),
        userParam.walletAddress,
      );
      // return
      return {
        encodedTxnData: encodedTransactions,
        rewardHistoryId: insertRewardHistoryResp[0]._id.toString(),
      };
    } catch (error) {
      this.logger.error(__filename, error.message);
    }
  };

  public userConfirmExchange = async (
    payload: ConfirmExchangeCollectionDto,
    userParam: IUser,
  ) => {
    // check burnt NFT
    for (const _txnSignature of payload.txnSignature) {
      // get parsed transaction
      const rawTx = await this.wrapperConnection.getParsedTransaction(
        _txnSignature,
      );
      // check tx
      this._validateBurnTransaction(rawTx, userParam.walletAddress);
    }

    // update reward_storage
    this.rewardHistoryService.findOneAndUpdate(
      {
        _id: new Types.ObjectId(payload.rewardHistoryId),
        user_id: new Types.ObjectId(userParam._id),
        channel_id: new Types.ObjectId(payload.channelId),
        nft_collection_id: new Types.ObjectId(payload.collectionId),
        status: STATUS.PROCESSING,
      },
      {
        status: STATUS.COMPLETED,
      },
    );
  };

  private _validateBurnTransaction = (
    transaction: ParsedTransactionWithMeta & { logMessages?: string[] },
    expectedNFTOwnerPublicKey: string,
  ) => {
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Check if the transaction was successful
    if (transaction.meta.err !== null) {
      throw new Error('Transaction failed');
    }

    const isBurntFunc = transaction.logMessages.some((_log: string) =>
      _log.includes('Instruction: Burn'),
    );
    const isSigner = transaction.transaction.message.accountKeys.some(
      (_acc) => _acc.pubkey.toString() === expectedNFTOwnerPublicKey,
    );

    if (isBurntFunc && isSigner) {
      this.logger.log('Burn instruction found');
      return;
    }

    throw new Error('No burn instruction found in the transaction');
  };
}
