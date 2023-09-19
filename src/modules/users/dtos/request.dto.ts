import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/user.constant';

export class GetListUserDto extends PaginateDto {
  @ApiProperty({ default: SORT_CONDITION.LATEST_UPDATE })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}
