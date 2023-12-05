import { Injectable } from '@nestjs/common';
import { NotificationBySegmentBuilder, OneSignalAppClient } from 'onesignal-api-client-core';
import { CreateInternalNotiDto, InternalNoti, InternalNotiDetailResponseDto, InternalNotificationsResponseDto, SORT_CONDITION, UpdateInternalNotiDto, UserNotiDetailResponseDto, UserNotiQuery, UserNotificationsResponseDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './notification.model';
import { Model, Types } from 'mongoose';
import { UserNoti, UserNotiDocument } from './userNoti.model';
import { User, UserDocument } from '../users/models/user.model';

@Injectable()
export class NotificationService {
  private readonly onesignalService: OneSignalAppClient;

  public constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(UserNoti.name)
    private readonly userNotificationModel: Model<UserNotiDocument>,
  ) {
    this.onesignalService = new OneSignalAppClient(
      process.env.ONESIGNAL_APP_ID,
      process.env.ONESIGNAL_REST_API_KEY
    );
  }
  private readonly defaultSelectFields: string = '';

  async sendNotification() {
    const input = new NotificationBySegmentBuilder()
    .setIncludedSegments(['Total Subscriptions'])
    .notification()
    .setContents({ en: 'Test notification' })
    .build();
    await this.onesignalService.createNotification(input);
  }

  async sendNotificationUsers(users: UserDocument[], notification: NotificationDocument): Promise<void> {
    users.map(async(user: UserDocument) => {
      await this.internalCreateUserNotification(user._id as string, notification._id as string);
    });
  }

  async internalCreateNotification(createNotiRequest: CreateInternalNotiDto): Promise<void> {
    await this.notificationModel.create([{...createNotiRequest}]);
  }

  async internalNotifications(internalNotification: InternalNoti): Promise<InternalNotificationsResponseDto> {
    const conditions = { ...internalNotification };
    const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all([
      this.getAllWithPagination(this.notificationModel, conditions),
      this.countItems(this.notificationModel, conditions)
    ]);

    return {totalItems, pageIndex, pageSize, items};
  }

  async internalDetailNotification(notificationId: string): Promise<InternalNotiDetailResponseDto> {
    return await this.notificationModel.findOne({_id: notificationId});
  }

  async internalUpdateNotification(notificationId: string, updateInternalNoti: UpdateInternalNotiDto): Promise<void> {
    await this.notificationModel.updateOne({ _id: notificationId }, { $set: updateInternalNoti });
  }

  async internalDeleteNotification(internalNotiId: string): Promise<void> {
    await this.notificationModel.findOneAndRemove({ _id: internalNotiId });
  }

  async internalCreateUserNotification(userId: string, notificationId: string): Promise<void> {
    await this.userNotificationModel.create([
      { userId: new Types.ObjectId(userId), notiId: new Types.ObjectId(notificationId) }
    ]);
  }

  async internalUserNotifications(internalNotification: UserNotiQuery): Promise<UserNotificationsResponseDto> {
    const conditions = { ...internalNotification };
    const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all([
      this.getAllWithPagination(this.userNotificationModel, conditions),
      this.countItems(this.userNotificationModel, conditions)
    ]);

    return {totalItems, pageIndex, pageSize, items};
  }

  async internalDetailUserNotification(userNotiId: string): Promise<UserNotiDetailResponseDto> {
    return await this.userNotificationModel.findOne({_id: userNotiId});
  }

  async internalDeleteUserNotification(userNotiId: string): Promise<void> {
    await this.userNotificationModel.findOneAndRemove({ _id: userNotiId });
  }

  // private function
  async getAllWithPagination(model: any, queryParams: any, querySelect?: string) {
    const pageIndex = queryParams.pageIndex;
    const pageSize = queryParams.pageSize;

    const select = querySelect || this.defaultSelectFields,
      populates = [];

    const collections = await model
      .find(this.makeFilterCondition(queryParams))
      .sort(this.makeSortCondition(queryParams))
      .skip(Math.max(pageSize * (pageIndex - 1), 0))
      .limit(pageSize)
      .select(select)
      .populate(populates)
      .lean();

    return { pageIndex, pageSize, items: collections };
  }

  public async countItems(model: any, queryParams: any) {
    const totalItems = await model.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
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
}
