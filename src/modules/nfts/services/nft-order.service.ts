import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/modules/base/services/base.service';
import { Order, OrderDocument } from '../models/order.model';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { SORT_CONDITION } from '../constants/nft.constant';
import { OrderHistoryService } from './order-history.service';
import {
  Connection,
  PublicKey,
  TransactionResponse,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { INFTCollection, INFTInfo } from '../interfaces/nft-info.interface';
import { Types } from 'mongoose';

@Injectable()
export class NFTOrderService extends BaseService<OrderDocument> {
  private readonly defaultSelectFields: string = '';
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly shyftWeb3Service: ShyftWeb3Service,
  ) {
    super(orderModel);
  }

  async listingOrder(params: any, user: IUser) {
    const listingParams = {
      ...params,
      seller: user.walletAddress,
      infoId: new Types.ObjectId(params.infoId),
    };
    try {
      return await this.orderModel.create([listingParams]);
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  private makeFilterCondition = ({ status }) => {
    return {
      ...(status !== undefined && { status }),
    }
  };

  private makeSortCondition = (queryParams: any) => {
    const sort =
      SORT_CONDITION[queryParams.sortCondition] || SORT_CONDITION.LATEST_UPDATE;
    return sort;
  };

  async getAllWithPagination(queryParams: any, querySelect?: string) {
    const pageIndex = queryParams.pageIndex;
    const pageSize = queryParams.pageSize;
    const filter = {...queryParams, status: 0}
    const select = querySelect || this.defaultSelectFields,
      populates = [];
    const collections = await this.orderModel
      .find(this.makeFilterCondition(filter))
      .sort(this.makeSortCondition(queryParams))
      .skip(Math.max(pageSize * (pageIndex - 1), 0))
      .limit(pageSize)
      .select(select)
      .populate(populates)
      .lean();

    return { pageIndex, pageSize, items: collections };
  }

  public async countItems(queryParams: any) {
    const totalItems = await this.orderModel.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
  }

  public async getListOrder(queryParams: any) {
    const conditions = { ...queryParams };

    const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all([
      this.getAllWithPagination(conditions),
      this.countItems(conditions),
    ]);

    return {
      totalItems,
      pageIndex,
      pageSize,
      items,
    };
  }

  async checkExistedTx({ tx }) {
    const his = await this.orderHistoryService.findOneByTx(tx);
    return !!his;
  }

  async addHistory(params: any, user: IUser) {
    await this.orderHistoryService.createOrderHistory(params, user);
  }

  async transferNftToUser(mint: string, userWallet: string) {
    const { tx } = await this.shyftWeb3Service.transferNftByShyft({
      nft_address: mint,
      receiver: userWallet,
    });

    if (!tx) throw new Error('Transfer nft error');

    return tx;
  }

  async getCurrentOrder(id: string) {
    return await this.orderModel.findById(id);
  }

  async getCurrentOrderBySeller(id: string, seller: string) {
    return await this.orderModel.findOne({_id: new Types.ObjectId(id), seller: seller });
  }

  async verifyTransaction(
    order: any,
    user: IUser,
    transactionInfo: TransactionResponse,
  ) {
    const {
      meta: { postBalances, preBalances },
      transaction: {
        message: { accountKeys },
      },
    } = transactionInfo;
    const [, afterBalance] = postBalances;
    const [, beforeBalace] = preBalances;
    const [sender] = accountKeys;
    const [, receiver] = accountKeys;
    const isPairWithWallet =
      sender.toBase58() == new PublicKey(user.walletAddress).toBase58() &&
      receiver.toBase58() == new PublicKey(order.seller).toBase58();
    const isValidAmount =
      (afterBalance - beforeBalace) / LAMPORTS_PER_SOL === Number(order.price);
    return isValidAmount && isPairWithWallet;
  }

  async checkTransactionValid(params: any, user: IUser, order: any) {
    const connection = new Connection(process.env.SOLANA_NETWORK);
    const transactionInfo: TransactionResponse =
      await connection.getTransaction(params.tx);
    if (!transactionInfo) throw new Error('Transaction not found');
    return await this.verifyTransaction(order, user, transactionInfo);
  }

  async transferNft(params: any, user: IUser) {
    const existTx = await this.checkExistedTx(params);
    if (existTx) throw new Error(`Transaction existed`);
    const currentOrder = await this.getCurrentOrder(params._id);
    if (!currentOrder) throw new Error(`order not found`);
    const isValid = await this.checkTransactionValid(
      params,
      user,
      currentOrder,
    );
    if (!isValid) throw new Error(`Transaction is invalid`);
    await this.addHistory({ tx: params.tx, orderId: params._id }, user);
    await this.transferNftToUser(currentOrder.mint, user.walletAddress);
    await this.orderModel.findByIdAndUpdate(currentOrder._id, {
      $set: { status: 1 }
    });
    return true;
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async cannelListing(params: any, user: IUser) {
    const currentOrder = await this.getCurrentOrderBySeller(params._id, user.walletAddress);
    if (!currentOrder) throw new Error(`order not found`);
    await this.transferNftToUser(currentOrder.mint, currentOrder.seller);
    await this.sleep(1000);
    await this.orderModel.findByIdAndDelete(params._id).exec();
  }

  public async checkIsListing(
    walletAddress: string,
    collections: INFTCollection[],
  ) {
    const _collectionToNFT = new Map<string, INFTInfo[]>();
    const _nftInfoId = [];
    collections.forEach((_collection) => {
      _collection.nft_info.forEach((_nft) => {
        _nftInfoId.push(_nft._id);
      });
      _collectionToNFT.set(_collection.address, _collection.nft_info);
    });

    try {
      if (_nftInfoId.length === 0) {
        return collections;
      }
      const nftOrderData = await this.orderModel.find({
        seller: walletAddress,
        infoId: {
          $in: _nftInfoId,
        },
      });
      if (nftOrderData.length === 0) return collections;

      const nftOrderMap = new Map();
      nftOrderData.forEach((_nftOrder) => {
        nftOrderMap.set(_nftOrder.infoId._id.toString(), {
          mint: _nftOrder.mint,
          orderId: _nftOrder._id.toString(),
        });
      });

      collections.forEach((_collection) => {
        const _nftInfo = _collectionToNFT.get(_collection.address);
        _nftInfo.forEach((_nft) => {
          const orderData = nftOrderMap.get(_nft._id.toString());
          if (!orderData) return;

          if (Array.isArray(_nft.order)) {
            _nft.order.push({
              order_id: orderData.orderId,
              mint: orderData.mint,
            });
          } else {
            _nft.order = [
              {
                order_id: orderData.orderId,
                mint: orderData.mint,
              },
            ];
          }
          _nft.owned = true;
        });

        const nftsInfoMap = new Map(
          _nftInfo.map((_item) => [_item._id, _item]),
        );

        for (const _nftInfo of _collection.nft_info) {
          const newNftInfo = nftsInfoMap.get(_nftInfo._id);
          if (newNftInfo) {
            _nftInfo.owned = true;
            _nftInfo.order = newNftInfo.order;
            _nftInfo.amount = newNftInfo.amount + 1;
          }
        }
      });
    } catch (error) {
      this.logger.error(__filename, error);
    }

    return collections;
  }
}
