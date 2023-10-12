/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { RewardService } from 'src/modules/reward/services/reward.service';
import axios from 'axios';

@Injectable()
export class NFTCollectionService extends BaseService<NFTCollectionDocument> {
  constructor(
    @InjectModel(NFTCollection.name)
    private readonly nftCollectionModel: Model<NFTCollectionDocument>,
    private readonly shyftWeb3Service: ShyftWeb3Service,
    private readonly channelService: ChannelService,
    private readonly rewardHistoryService: RewardHistoryService,
    private readonly rewardService: RewardService,
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
        const channelData = await this.channelService.findOneById(channelId);
        // @ts-ignore
        _data.receiver = channelData.donateReceiver;
        const resp = await this.shyftWeb3Service.mintCollectionNFT(_data);
        const collectionData =
          await this.shyftWeb3Service.getCollectionByAddress(resp.address);
        _formatData.push({
          _id: _data._id,
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

      result = await Promise.all(
        items
          .filter(
            (_item) => _item.ownership.owner === walletAddress && !_item.burnt,
          )
          .map(async (_item) => {
            const { data } = await axios.get(_item.content.json_uri);
            _item.content.metadata.attributes = data.attributes;
            return _item;
          }),
      );
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
      const itemIndexes = userNFTData
        .flatMap((_item) => {
          const attributes = _item.content.metadata.attributes;
          if (Array.isArray(attributes)) {
            const indexAttribute = attributes.find(
              (attr) => attr.trait_type === 'index',
            );
            if (indexAttribute) {
              return {
                index: indexAttribute.value,
                mint: _item.id,
              };
            }
          }
          return null;
        })
        .filter(Boolean); // filter out null values

      // check owned
      collectionData.nft_info.forEach((_collectionItems) => {
        const indexAttribute = _collectionItems.attributes.find(
          (attr) => attr.trait_type === 'index',
        );
        if (indexAttribute) {
          const ownedItem = itemIndexes.filter(
            (_item) => _item.index === indexAttribute.value,
          );
          if (ownedItem.length > 0) {
            _collectionItems.owned = true;
            _collectionItems.amount = ownedItem.length;
            _collectionItems.order = ownedItem.map((_item) => ({
              order_id: null,
              mint: _item.mint,
            }));
          } else {
            _collectionItems.owned = false;
            _collectionItems.amount = 0;
          }
        }
      });
    } catch (error) {
      this.logger.error(__filename, error);
    }
  };

  public find = async (
    query: INFTCollection | any,
  ): Promise<INFTCollection[]> =>
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
            localField: 'address',
            foreignField: 'nft_collection_address',
            as: 'reward_data',
          },
        },
        {
          $lookup: {
            from: 'rewardhistories',
            localField: 'address',
            foreignField: 'nft_collection_address',
            as: 'reward_history_data',
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
        channel_id: payload.channelId,
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
            user_id: userParam._id,
            channel_id: new Types.ObjectId(payload.channelId),
            reward_id: collectionData.reward_data[0]._id,
            nft_collection_address: collectionData.address,
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
    await this.rewardHistoryService.findOneAndUpdate(
      {
        _id: payload.rewardHistoryId,
        user_id: new Types.ObjectId(userParam._id),
        channel_id: new Types.ObjectId(payload.channelId),
        status: STATUS.PROCESSING,
      },
      {
        status: STATUS.COMPLETED,
      },
    );
  };

  private _validateBurnTransaction = (
    transaction: ParsedTransactionWithMeta,
    expectedNFTOwnerPublicKey: string,
  ) => {
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Check if the transaction was successful
    if (transaction.meta.err !== null) {
      throw new Error('Transaction failed');
    }

    const isBurntFunc = transaction.meta.logMessages.some((_log: string) =>
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
