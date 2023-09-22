import {
  Controller,
  Get,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/common/cache';

import { GetNFTInfoDetailResponseDto } from './dtos/response.dto';

import { UserParams } from 'src/decorators/user-params.decorator';
import { Role } from 'src/modules/users/constants/user.constant';
import { IUser } from 'src/modules/users/interfaces/user.interface';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

import { NFTInfoService } from './services/nft-info.service';
import { NFTReceiveService } from './services/nft-receive.service';

// import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/guards/roles.guard';
import { MongoIdDto } from 'src/common/classes';

@ApiTags('nfts')
@Controller('nfts')
export class NftController {
  constructor(
    private readonly nftInfoService: NFTInfoService,
    private readonly nftReceiveService: NFTReceiveService,
  ) {}

  @Get('metadata/:id')
  @ApiOkResponse({ type: GetNFTInfoDetailResponseDto })
  @ApiBadRequestResponse({ description: 'NFTInfo not found' })
  async getNFTInfoById(@Param() params: MongoIdDto): Promise<any> {
    const nftInfoId = params.id;

    return await this.nftInfoService.findOneById(nftInfoId);
  }

  @Get('users/:walletAddress')
  @CacheTTL(1 * 60 * 1000) // 1 minute
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getNFTByUser(
    @Param('walletAddress') walletAddress: string,
    @UserParams() userParams: IUser,
  ): Promise<any> {
    if (walletAddress !== userParams.walletAddress)
      throw new UnauthorizedException('Unauthorized');

    return this.nftReceiveService.getNFTByUser(walletAddress);
  }
}
