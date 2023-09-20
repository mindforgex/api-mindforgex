import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';

import { Channel } from '../models/channel.model';

export class GetListChannelResponseDto extends PaginateResponseDto<Channel> {}
export class ChannelDetaitResponseDto extends MongoItemDto<Channel> {}
