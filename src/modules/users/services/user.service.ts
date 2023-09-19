import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import {
  PasswordResetStatus,
  Role,
  SORT_CONDITION,
} from '../constants/user.constant';

import { BaseService } from 'src/modules/base/services/base.service';

import { User, UserDocument } from '../models/user.model';

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

  public findOneByEmail = (email: string, selectFields?: string) =>
    this.userModel
      .findOne({ email }, selectFields ?? this.defaultSelectFields)
      .lean();

  public findOneByTwitterId = (twitterId: string, selectFields?: string) =>
    this.userModel
      .findOne({ twitterId }, selectFields ?? this.defaultSelectFields)
      .lean();

  async findByEmailAndUpsert(
    email: string,
    update: any,
    session?: ClientSession,
  ) {
    const userUpdated = await this.userModel
      .findOneAndUpdate({ email }, update, {
        new: true,
        upsert: true,
        fields: this.defaultSelectFields,
        session,
      })
      .lean();

    return userUpdated;
  }

  async findByTwitterIdAndUpsert(
    twitterId: string,
    update: any,
    session?: ClientSession,
  ) {
    const userUpdated = await this.userModel
      .findOneAndUpdate({ twitterId }, update, {
        new: true,
        upsert: true,
        fields: this.defaultSelectFields,
        session,
      })
      .lean();

    return userUpdated;
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

  public async getListUserByAdmin(queryParams: any) {
    const conditions = { ...queryParams, role: Role.commonUser };

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

  public findAll = () => this.userModel.find().lean();

  public async updateAfterTransferred(
    userId: string,
    params: {
      transferredAt: Date;
      contractAddress: string;
      collectionName: string;
    },
    session: ClientSession,
  ) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        transferredAt: params.transferredAt,
        contractAddress: params.contractAddress,
        collectionName: params.collectionName,
      },
      { session },
    );
  }

  async findUserByActivePasswordResetToken(
    passwordResetToken: string,
    session: ClientSession,
  ) {
    const users = await this.userModel
      .find({
        passwordResetToken,
      })
      .session(session);

    if (!users.length)
      throw new BadRequestException('Password reset token is invalid');

    if (users.length !== 1) {
      this.logger.error(
        `Duplicate pw reset token ${passwordResetToken}, ${users.length} users found.`,
      );
      throw new InternalServerErrorException({
        message: 'Please try again.',
      });
    }

    const [user] = users;
    if (
      user.passwordResetExpiredAt &&
      user.passwordResetExpiredAt >= Date.now() &&
      user.passwordResetStatus === PasswordResetStatus.unconfirmed
    )
      return user;

    throw new BadRequestException('Password reset token is expired');
  }

  public async exportUsers() {
    const users = await this.userModel.aggregate([
      {
        $match: { role: Role.commonUser },
      },
      {
        $sort: this.makeSortCondition({}),
      },
      {
        $lookup: {
          from: 'nftreceives',
          localField: '_id',
          foreignField: 'userId',
          as: 'nftReceives',
        },
      },
      {
        $unwind: {
          path: '$nftReceives',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          email: 1,
          twitterUsername: 1,
          transferredAt: 1,
          collection: '$nftReceives.collectionName',
          tokenId: '$nftReceives.tokenId',
          receivedAt: '$nftReceives.createdAt',
        },
      },
    ]);

    return users;
  }
}
