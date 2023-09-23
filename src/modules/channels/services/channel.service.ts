import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SORT_CONDITION } from '../constants/channel.constant';

import { BaseService } from 'src/modules/base/services/base.service';
import { Channel, ChannelDocument } from '../models/channel.model';

@Injectable()
export class ChannelService extends BaseService<ChannelDocument> {
  constructor(
    @InjectModel(Channel.name)
    private readonly channelModel: Model<ChannelDocument>,
  ) {
    super(channelModel);
  }

  private readonly defaultSelectFields: string =
    '-posBadRequestExceptionts, -nftInfos';

  public findOneById = (channelId: string, selectFields?: string) =>
    this.channelModel
      .findOne({ _id: channelId }, selectFields ?? this.defaultSelectFields)
      .populate([
        'nftInfos',
        { path: 'posts', populate: { path: 'tasks', model: 'Task' } },
        { path: 'posts', populate: { path: 'nftId', model: 'NFTInfo' } },
      ])
      .lean();

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

  async subscribe(channelId: string, requestData: any): Promise<any> {
    const userAddress = requestData.walletAddress;

    try {
      const updatedChannel = await this.channelModel.findOneAndUpdate(
        { _id: channelId, userSubcribe: { $nin: [userAddress] } },
        {
          $inc: { follower: 1 },
          $push: { userSubcribe: userAddress },
        },
        { new: true },
      );

      if (!updatedChannel) {
        throw new BadRequestException('already subscribed');
      }

      return updatedChannel;
    } catch (error) {
      throw new Error(
        `Error adding user to subscription list: ${error.message}`,
      );
    }
  }

  public async getChannelByUserSubscribe(channelId: string, userAddr: string) {
    return await this.channelModel
      .findOne({ _id: channelId, userSubcribe: { $in: [userAddr] } })
      .lean();
  }
}
