import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/nft.constant';

export class GetListNFTInfoDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}
