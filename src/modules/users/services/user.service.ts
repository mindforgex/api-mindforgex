import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model, ProjectionType } from 'mongoose';

import { SNS_TYPE, SORT_CONDITION } from '../constants/user.constant';

import { BaseService } from 'src/modules/base/services/base.service';

import { User, UserDocument } from '../models/user.model';
import { ConnectTwitchDto } from '../dtos/request.dto';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  private readonly defaultSelectFields: string = '-__v -password';

  public findOneById = (userId: string, selectFields?: string) =>
    this.userModel
      .findOne({ _id: userId }, selectFields ?? this.defaultSelectFields)
      .lean();

  public findOneByCondition = (
    condition: FilterQuery<UserDocument>,
    projection?: ProjectionType<UserDocument>,
  ) =>
    this.userModel
      .findOne(condition, projection ?? this.defaultSelectFields)
      .lean();

  public findOneByWalletAddress = (
    walletAddress: string,
    selectFields?: string,
  ) =>
    this.userModel
      .findOne({ walletAddress }, selectFields ?? this.defaultSelectFields)
      .lean();

  async findByWalletAddressAndUpsert(
    walletAddress: string,
    update: any,
    session?: ClientSession,
  ) {
    const userUpdated = await this.userModel
      .findOneAndUpdate({ walletAddress }, update, {
        new: true,
        upsert: true,
        fields: this.defaultSelectFields,
        session,
      })
      .lean();

    return userUpdated;
  }

  async findByIdAndUpdate(
    userId: string,
    update: any,
    session?: ClientSession,
  ) {
    const userUpdate = await this.userModel
      .findOneAndUpdate({ _id: userId }, update, {
        new: true,
        fields: this.defaultSelectFields,
        session,
      })
      .lean();

    return userUpdate;
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

    const collections = await this.userModel
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
    const totalItems = await this.userModel.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
  }

  public findAll = () => this.userModel.find().lean();

  public updateDiscordInfo = async (
    walletAddress: string,
    discordId: string,
    discordUsername: string,
  ) => {
    await this.userModel.updateOne(
      { walletAddress },
      {
        // hasDiscord: true,
        discordId,
        discordUsername,
      },
    );
  };

  public updateToken = async (
    walletAddress: string,
    registratorToken: string,
  ): Promise<void> => {
    await this.userModel.updateOne({ walletAddress }, { registratorToken });
  };

  updateTwitchInfo = async (walletAddress: string, data: ConnectTwitchDto) => {
    await this.userModel.updateOne({ walletAddress }, data);
  };

  disconnectSns = async (
    user: IUser,
    sns: (typeof SNS_TYPE)[keyof typeof SNS_TYPE],
  ): Promise<IUser> => {
    const keys = Object.keys(user)
      /**
       * @dev filter field includes sns name
       * ex:
       *  - input: 'discord'
       *  - output: ['discord_foo', 'discord_bar']
       */
      .filter((_key) => _key.toLowerCase().includes(sns.toLowerCase()));
    /**
     * @dev mapping keys to object with empty value
     * ex:
     *  input: ['discord_foo', 'discord_bar']
     *  output: {discord_foo: '', discord_bar: ''}
     */
    const updateData = keys.reduce((obj, key) => ({ ...obj, [key]: '' }), {});
    const res = await this.userModel.updateOne(
      {
        _id: user._id,
      },
      updateData,
    );
    if (res.modifiedCount === 0) {
      throw new InternalServerErrorException(res);
    }
    return this.userModel.findById(user._id);
  };
}
