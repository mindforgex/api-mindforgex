import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SORT_CONDITION } from '../constants/donate.constant';

import { BaseService } from 'src/modules/base/services/base.service';
import { Donate, DonateDocument } from '../models/donate.model';

@Injectable()
export class DonateService extends BaseService<DonateDocument> {
  constructor(
    @InjectModel(Donate.name)
    private readonly donateModel: Model<DonateDocument>,
  ) {
    super(donateModel);
  }

  private readonly defaultSelectFields: string = '';

  public findOneById = (channelId: string, selectFields?: string) =>
    this.donateModel
      .findOne({ _id: channelId }, selectFields ?? this.defaultSelectFields)
      .populate([
        'nftInfos',
        { path: 'posts', populate: { path: 'tasks', model: 'Task' } },
        { path: 'posts', populate: { path: 'nftId' } },
      ])
      .lean();

  public async getListDonateByUser(userWallet: string) {
    return await this.donateModel
      .find({ userWallet: userWallet })
      .lean();
  }

  public async getListDonateByChannel(channelId: string) {
    return await this.donateModel
      .find({ channelId: channelId })
      .lean();
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

    const collections = await this.donateModel
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
    const totalItems = await this.donateModel.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
  }

  public async storeDonate(dataArray: any) {
    return await this.donateModel.create(dataArray);
  }

  public async findByTx(tx: string) {
    return this.donateModel.findOne({ transactionHash: tx }).lean();
  }
}
