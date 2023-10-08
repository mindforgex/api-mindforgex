import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';

import { Donate } from '../models/donate.model';

export class GetListDonateResponseDto extends PaginateResponseDto<Donate> {}
export class DonateDetaitResponseDto extends MongoItemDto<Donate> {}
