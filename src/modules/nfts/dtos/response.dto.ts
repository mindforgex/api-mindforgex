import { MongoItemDto, PaginateResponseDto } from 'src/common/classes';

import { NFTInfo } from '../models/nft-info.model';
import { INFTCollection } from '../interfaces/nft-info.interface';
import { ApiResponseProperty } from '@nestjs/swagger';

export class GetListNFTInfoResponseDto extends PaginateResponseDto<NFTInfo> {}

export class GetNFTInfoDetailResponseDto extends MongoItemDto<NFTInfo> {}

export class GetListCollectionResponseDto extends PaginateResponseDto<INFTCollection> {}

export class RequestExchangeCollectionResponseDto {
  @ApiResponseProperty()
  readonly encodedTxnData: string[];

  @ApiResponseProperty()
  readonly rewardHistoryId: string;
}
