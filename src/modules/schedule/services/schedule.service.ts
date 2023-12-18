import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import { NFTInfo } from 'src/modules/nfts/models/nft-info.model';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { UserService } from 'src/modules/users/services/user.service';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { UserStatus } from 'src/modules/users/constants/user.constant';
import { ChannelService } from 'src/modules/channels/services/channel.service';
import { ChannelNotFoundException } from 'src/exceptions/channel-not-found.exception';
import { TaskService } from 'src/modules/tasks/services/task.service';
import { LIST_TASK_OPTIONS } from 'src/common/constants';
import { TaskStatus } from 'src/modules/tasks/constants/task.constant';
import { Schedule, ScheduleDocument } from '../models/schedule.model';
import {
  CreateScheduleDto,
  GetListScheduleDto,
  UpdateScheduleDto,
} from '../dtos/request.dto';
import { SORT_CONDITION } from '../constants/schedule.constant';

@Injectable()
export class ScheduleService extends BaseService<ScheduleDocument> {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {
    super(scheduleModel);
  }

  private readonly defaultSelectFields: string = '';

  private makeFilterCondition = (queryParams: GetListScheduleDto) => {
    const { pageIndex, pageSize, sortCondition, ...params } = queryParams;
    const { channelId, ...condition } = params;
    return {
      ...(channelId && { channelId: new Types.ObjectId(channelId) }),
      ...condition,
    };
  };

  private makeSortCondition = (sortCondition: string | undefined) =>
    SORT_CONDITION[sortCondition] || SORT_CONDITION.LATEST_UPDATE;

  async getAllWithPagination(
    queryParams: GetListScheduleDto,
    querySelect?: string,
  ) {
    const { pageIndex, pageSize, sortCondition } = queryParams;

    const select = querySelect || this.defaultSelectFields,
      populates = [];

    const collections = await this.scheduleModel
      .find(this.makeFilterCondition(queryParams))
      .sort(this.makeSortCondition(sortCondition))
      .skip(Math.max(pageSize * (pageIndex - 1), 0))
      .limit(pageSize)
      .select(select)
      .populate(populates)
      .lean();

    return { pageIndex, pageSize, items: collections };
  }

  public async countItems(queryParams: GetListScheduleDto) {
    const totalItems = await this.scheduleModel.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
  }

  public async getListSchedule(queryParams: GetListScheduleDto) {
    const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all([
      this.getAllWithPagination(queryParams),
      this.countItems(queryParams),
    ]);

    return {
      totalItems,
      pageIndex,
      pageSize,
      items,
    };
  }

  public findOneById = (
    scheduleId: string,
    projection?: ProjectionType<ScheduleDocument>,
  ) =>
    this.scheduleModel
      .findOne({ _id: scheduleId }, projection ?? this.defaultSelectFields)
      .lean();

  async createSchedule(
    dataSchedule: CreateScheduleDto,
    user: IUser,
  ): Promise<Schedule> {
    const { _id: userId } = user;
    const { channelId, title, description, date, file } = dataSchedule;

    // EXPLAIN: Check user existence and activity status
    const userExits = await this.userService.findOneByCondition({
      _id: userId,
      status: UserStatus.active,
    });
    if (!userExits) throw new UserNotFoundException();

    // EXPLAIN: Check if the channel exists and if the schedule is owned by the user
    const channelExits = await this.channelService.findOneByCondition({
      _id: channelId,
      userId: userId,
    });
    if (!channelExits) throw new ChannelNotFoundException();

    //TODO: Handling and saving files in the cloud or server
    const cover = '';

    // EXPLAIN: Create schedule
    const schedule = await this.scheduleModel.create({
      channelId: new Types.ObjectId(channelId),
      title,
      description,
      date,
      cover,
    });

    return schedule;
  }

  async updateSchedule(
    dataSchedule: UpdateScheduleDto,
    scheduleId: string,
    user: IUser,
  ): Promise<Schedule> {
    const { _id: userId } = user;
    // const { channelId, title, content, tasks, file } = dataSchedule;
    const { channelId, title, description, date, file } = dataSchedule;

    // EXPLAIN: Check user existence and activity status
    const userExits = await this.userService.findOneByCondition({
      _id: userId,
      status: UserStatus.active,
    });
    if (!userExits) throw new UserNotFoundException();

    // EXPLAIN: Check if the channel exists and if the schedule is owned by the user
    const channelExits = await this.channelService.findOneByCondition({
      _id: channelId,
      userId: userId,
    });
    if (!channelExits) throw new ChannelNotFoundException();

    //TODO: Handling and saving files in the cloud or server
    const cover = '';

    // EXPLAIN: Update schedule
    const updateSchedule = await this.scheduleModel.findOneAndUpdate(
      { _id: scheduleId, channelId },
      {
        title,
        description,
        date,
        cover,
      },
    );
    return updateSchedule;
  }

  async deleteSchedule(scheduleId: string, user: IUser) {}
}
