import { Controller, Get, Query, Res, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { GetListNFTInfoDto } from './dtos/request.dto';
import { GetListNFTInfoResponseDto, NFTInfoDetaitResponseDto } from './dtos/response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { NFTInfoService } from './services/nft_info.service';
import { MongoIdDto } from 'src/common/classes';

@ApiTags('nft_infos')
@Controller('nft_infos')
export class NftInfoController {
  constructor(private readonly nftInfoService: NFTInfoService) {}

  @Get('/:id')
  @ApiOkResponse({ type: NFTInfoDetaitResponseDto })
  @ApiBadRequestResponse({ description: 'NFTInfo not found' })
  async getNFTInfoById(
    @Param() params: MongoIdDto,
  ): Promise<any> {
    const nftInfoId = params.id;

    return await this.nftInfoService.findOneById(nftInfoId);
  }
}
