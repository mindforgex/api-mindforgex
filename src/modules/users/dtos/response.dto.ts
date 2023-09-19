import { PaginateResponseDto } from 'src/common/classes';

import { User } from '../models/user.model';

export class GetListUserResponseDto extends PaginateResponseDto<User> {}
