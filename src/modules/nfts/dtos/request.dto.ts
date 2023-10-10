import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/nft.constant';

export class GetListNFTInfoDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class GetListNFTCollection extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;

  @ApiProperty()
  @IsString()
  channelId: string;
}

export class RequestExchangeCollectionDto {
  @ApiProperty()
  @IsString()
  readonly collectionId: string;

  @ApiProperty()
  @IsString()
  readonly channelId: string;
}

export class ConfirmExchangeCollectionDto {
  @ApiProperty()
  @IsString()
  readonly channelId: string;

  @ApiProperty()
  @IsArray()
  readonly txnSignature: string[];

  @ApiProperty()
  @IsString()
  readonly rewardHistoryId: string;
}
