import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/channel.constant';

export class GetListChannelDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class GenTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number
}

export class DonateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tx: string
}
