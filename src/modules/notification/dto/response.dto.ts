import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';
import { Notification } from '../notification.model';
import { UserNoti } from '../userNoti.model';

export class InternalNotificationsResponseDto extends PaginateResponseDto<Notification> {}
export class InternalNotiDetailResponseDto extends MongoItemDto<Notification> {}

export class UserNotificationsResponseDto extends PaginateResponseDto<UserNoti> {}
export class UserNotiDetailResponseDto extends MongoItemDto<UserNoti> {}
