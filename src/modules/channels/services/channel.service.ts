import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SORT_CONDITION } from '../constants/channel.constant';

import { BaseService } from 'src/modules/base/services/base.service';
import { Channel, ChannelDocument } from '../models/channel.model';
import {
  NFTCollection,
  NFTCollectionDocument,
} from 'src/modules/nfts/models/nft-collection.model';
import { DonateService } from 'src/modules/donates/services/donate.service';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionResponse,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  CreateChannelDto,
  UpdateAboutMeChannelDto,
  UpdateChannelDto,
} from '../dtos/request.dto';
import { Social } from '../interfaces/channel.interface';
import { UserService } from 'src/modules/users/services/user.service';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import {
  UserStatus,
  UserType,
} from 'src/modules/users/constants/user.constant';
import { ChannelExitsException } from 'src/exceptions/channel-exits.exception';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { ChannelNotFoundException } from 'src/exceptions/channel-not-found.exception';

@Injectable()
export class ChannelService extends BaseService<ChannelDocument> {
  constructor(
    @InjectModel(Channel.name)
    private readonly channelModel: Model<ChannelDocument>,
    private readonly userService: UserService,
    private readonly donateService: DonateService,
    @InjectModel(NFTCollection.name)
    private readonly nftCollectionModel: Model<NFTCollectionDocument>,
  ) {
    super(channelModel);
  }

  private readonly defaultSelectFields: string =
    '-posBadRequestExceptionts, -nftCollections';

  public async findOneById(channelId: string, selectFields?: string) {
    const channelQuery = this.channelModel
      .findOne({ _id: channelId }, selectFields ?? this.defaultSelectFields)
      .populate([
        'nftCollections',
        'donates',
        { path: 'posts', populate: { path: 'tasks', model: 'Task' } },
        { path: 'posts', populate: { path: 'nftId' } },
      ])
      .lean();
    const channel = await channelQuery.exec();

    const numberPosts =
      typeof channel.posts !== 'undefined' ? channel.posts.length : 0;
    const numberSubscribers =
      typeof channel.userSubcribe !== 'undefined'
        ? channel.userSubcribe.length
        : 0;

    const nftCollections = await this.nftCollectionModel.find({
      channel_id: channelId,
    });
    const numberCollections = nftCollections.length;

    return {
      ...channel,
      nftCollections,
      numberPosts,
      numberSubscribers,
      numberCollections,
    };
  }

  public async getListChannel(queryParams: any) {
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

  private makeFilterCondition = ({ network = null, role = null }) => ({
    ...(network && { network }),
    ...(role && { role }),
  });

  private makeSortCondition = (queryParams: any) => {
    const sort =
      SORT_CONDITION[queryParams.sortCondition] || SORT_CONDITION.LATEST_UPDATE;
    // sort['_id'] = -1;

    return sort;
  };

  private fomartSocialLinks = ({
    discord = '',
    youtube = '',
    x = '',
    followerYoutube = 0,
    followerTwitter = 0,
  }): Social[] => {
    const socialLinks: Social[] = [];
    youtube &&
      socialLinks.push({
        url: youtube,
        name: 'youtube',
        icon: '',
        totalFollower: followerYoutube,
      });
    discord &&
      socialLinks.push({
        url: discord,
        name: 'discord',
        icon: '',
        totalFollower: 0,
      });
    x &&
      socialLinks.push({
        url: x,
        name: 'x',
        icon: '',
        totalFollower: followerTwitter,
      });
    return socialLinks;
  };

  async getAllWithPagination(queryParams: any, querySelect?: string) {
    const pageIndex = queryParams.pageIndex;
    const pageSize = queryParams.pageSize;

    const select = querySelect || this.defaultSelectFields,
      populates = [];

    const collections = await this.channelModel
      .find(this.makeFilterCondition(queryParams))
      .sort(this.makeSortCondition(queryParams))
      .skip(Math.max(pageSize * (pageIndex - 1), 0))
      .limit(pageSize)
      .select(select)
      .populate(populates)
      .lean();

    return { pageIndex, pageSize, items: collections };
  }

  public async countItems(queryParams: any) {
    const totalItems = await this.channelModel.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
  }

  public async createMultiChannel(dataArray: any[]) {
    try {
      // Create many channels info
      const channels = await this.channelModel.create(dataArray);
      return channels;
    } catch (error) {
      throw new Error(`Error creating channels: ${error.message}`);
    }
  }

  public async clearChannels() {
    try {
      // Delete all channels info
      await this.channelModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing channels: ${error.message}`);
    }
  }

  public async updateMultiChannel(dataArray: any) {
    try {
      const channelsUpdated = await this.channelModel.updateMany(
        {},
        { $set: dataArray },
      );

      return channelsUpdated;
    } catch (error) {
      throw new Error(`Error update channels: ${error.message}`);
    }
  }

  async subscribeOrUnSubscribe(channelId: string, requestData: any): Promise<any> {
    const userAddress = requestData.walletAddress;
    const channelInfo = await this.channelModel.findOne({ _id: channelId });

    if (!channelInfo) {
      throw new BadRequestException('Cannot find channel');
    }

    try {
      if (channelInfo.userSubcribe.includes(userAddress)) {
        // unsubscribe
        await this.channelModel.findOneAndUpdate(
          { _id: channelId },
          {
            $inc: { follower: -1 },
            $pull: { userSubcribe: userAddress },
          },
          { new: true },
        );

        return {message: "UnSubscribed successfully"};
      }
      // subscribe
      await this.channelModel.findOneAndUpdate(
        { _id: channelId, userSubcribe: { $nin: [userAddress] } },
        {
          $inc: { follower: 1 },
          $push: { userSubcribe: userAddress },
        },
        { new: true },
      );

      return {message: "Subscribed successfully"};
    } catch (error) {
      throw new Error(
        `Subscribed or UnSubscribed error: ${error.message}`,
      );
    }
  }

  public async getChannelByUserSubscribe(channelId: string, userAddr: string) {
    return this.channelModel
      .findOne({ _id: channelId, userSubcribe: { $in: [userAddr] } })
      .lean();
  }

  public async genTransaction(channelId: string, requestData: any, body: any) {
    const userAddress = requestData.walletAddress;
    const selectFields = '_id, donateReceiver';
    const channel = await this.channelModel.findOne(
      { _id: channelId },
      selectFields ?? this.defaultSelectFields,
    );
    if (!channel) {
      return '';
    }
    const receiverAddress = channel.donateReceiver;

    const publicKeySender = new PublicKey(userAddress);
    const publicKeyReciever = new PublicKey(receiverAddress);
    const amountLamports = body.amount * LAMPORTS_PER_SOL; // 1 SOL = 1,000,000,000 lamports

    const connection = new Connection(process.env.SOLANA_NETWORK);
    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKeySender,
        toPubkey: publicKeyReciever,
        lamports: amountLamports,
      }),
    );

    transaction.feePayer = publicKeySender;
    transaction.recentBlockhash = latestBlockhash.blockhash;

    return transaction;
  }

  public async donateToChannel(channelId: string, requestData: any, body: any) {
    const selectFields = '_id, donateReceiver';
    const channel = await this.channelModel.findOne(
      { _id: channelId },
      selectFields ?? this.defaultSelectFields,
    );

    if (!channel) {
      throw new Error('Channel not found');
    }
    const { donateReceiver: receiverAddress } = channel;

    const senderAddress = requestData.walletAddress;

    const connection = new Connection(process.env.SOLANA_NETWORK);
    const tx = body.tx;
    const transactionInfo: TransactionResponse =
      await connection.getTransaction(tx);
    if (!transactionInfo) {
      throw new Error('Transaction not found');
    }
    const {
      meta: { postBalances, preBalances },
      transaction: {
        message: { accountKeys },
      },
    } = transactionInfo;
    const [, afterBalance] = postBalances;
    const [, beforeBalance] = preBalances;
    const [sender] = accountKeys;
    const [, receiver] = accountKeys;

    const isSuccess =
      (afterBalance - beforeBalance) / LAMPORTS_PER_SOL === body.amount &&
      sender.toBase58() == new PublicKey(senderAddress).toBase58() &&
      receiver.toBase58() == new PublicKey(receiverAddress).toBase58();

    if (!isSuccess) {
      throw new Error('Decode failed transaction');
    }

    try {
      const donate = await this.donateService.findByTx(tx);
      if (donate) {
        throw new Error('Tx invalid');
      }
      // store data donate
      const data = {
        channelId: channelId,
        userWallet: senderAddress,
        channelWallet: receiverAddress,
        amount: body.amount,
        transactionHash: tx,
        dateTimeDonate: new Date(),
      };
      const donateItem = await this.donateService.storeDonate(data);

      await this.channelModel.updateOne(
        { _id: channelId },
        { $push: { donates: donateItem } },
      );

      await this.channelModel.findByIdAndUpdate(channelId, {
        $inc: { amountDonate: body.amount },
      });

      return true;
    } catch (error) {
      throw new Error('Store Info Donate Fail');
    }
  }

  async createChannel(
    dataChannel: CreateChannelDto,
    user: IUser,
  ): Promise<Channel> {
    const { youtube, discord, x, userType, email, ...data } = dataChannel;
    const { _id: userId } = user;

    const updateUser = await this.userService.findByIdAndUpdate(userId, {
      status: UserStatus.active,
      userType,
      email,
    });

    if (!updateUser) throw new UserNotFoundException();

    if (userType === UserType.user) return;

    const channelExits = await this.channelModel.findOne({ userId }).lean();
    if (channelExits) throw new ChannelExitsException();

    const socialLinks = this.fomartSocialLinks({ youtube, discord, x });

    const channel = await this.channelModel.create({
      ...data,
      socialLinks,
      userId,
    });

    return channel.save();
  }

  async updateChannel(
    dataChannel: UpdateChannelDto,
    idChannel: string,
    user: IUser,
  ): Promise<Channel> {
    const dataUser = await this.userService.findOneById(user._id);
    if (!dataUser) throw new UserNotFoundException();
    const {
      discord,
      youtube,
      x,
      followerYoutube,
      followerTwitter,
      country,
      ...data
    } = dataChannel;

    const socialLinks = this.fomartSocialLinks({
      youtube,
      discord,
      x,
      followerYoutube,
      followerTwitter,
    });

    const channelUpdate = await this.channelModel
      .findOneAndUpdate(
        { _id: idChannel, userId: user._id },
        { ...data, socialLinks, country: { icon: '', name: country } },
        {
          new: true,
          fields: this.defaultSelectFields,
        },
      )
      .lean();
    return channelUpdate;
  }

  async updateAboutMe(
    data: UpdateAboutMeChannelDto,
    idChannel: string,
    user: IUser,
  ): Promise<Channel> {
    const dataUser = await this.userService.findOneById(user._id);
    if (!dataUser) throw new UserNotFoundException();
    const { aboutMe } = data;
    const aboutMeUpdate = await this.channelModel
      .findOneAndUpdate(
        { _id: idChannel, userId: user._id },
        { aboutMe },
        {
          new: true,
          fields: this.defaultSelectFields,
        },
      )
      .lean();
    return aboutMeUpdate;
  }
}
