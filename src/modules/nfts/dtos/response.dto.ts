import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';

import { NFTInfo } from '../models/nft-info.model';

export class GetListNFTInfoResponseDto extends PaginateResponseDto<NFTInfo> {}
export class NFTInfoDetaitResponseDto extends MongoItemDto<NFTInfo> {}
