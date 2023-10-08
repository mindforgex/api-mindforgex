import { PaginateResponseDto } from 'src/common/classes';

import { IReward, IRewardHistory } from '../interfaces/reward.interface';

export class GetListRewardHistoryResponseDto extends PaginateResponseDto<IRewardHistory> {}

export class GetListRewardResponseDto extends PaginateResponseDto<IReward> {}
