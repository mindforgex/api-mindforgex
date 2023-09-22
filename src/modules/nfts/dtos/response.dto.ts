import { MongoItemDto, PaginateResponseDto } from 'src/common/classes';

import { NFTInfo } from '../models/nft-info.model';

export class GetListNFTInfoResponseDto extends PaginateResponseDto<NFTInfo> {}

export class GetNFTInfoDetailResponseDto extends MongoItemDto<NFTInfo> {}
