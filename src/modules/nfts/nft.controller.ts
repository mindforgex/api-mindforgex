import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UnauthorizedException,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/common/cache';

import {
  GetListCollectionResponseDto,
  GetNFTInfoDetailResponseDto,
  RequestExchangeCollectionResponseDto,
} from './dtos/response.dto';

import { UserParams } from 'src/decorators/user-params.decorator';
import { Role } from 'src/modules/users/constants/user.constant';
import { IUser } from 'src/modules/users/interfaces/user.interface';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

import { NFTInfoService } from './services/nft-info.service';
import { NFTReceiveService } from './services/nft-receive.service';
import { NFTCollectionService } from './services/nft-collection.service';
import { NFTOrderService } from './services/nft-order.service';

// import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/guards/roles.guard';
import { MongoIdDto } from 'src/common/classes';
import { JsonMetadata } from '../base/interface/wrapped-solana-connection.type';
import { INFTCollection } from './interfaces/nft-info.interface';
import {
  ConfirmExchangeCollectionDto,
  RequestExchangeCollectionDto,
} from './dtos/request.dto';
import { GetListOrderDto } from '../channels/dtos/request.dto';
import { Types } from 'mongoose';

@ApiTags('nfts')
@Controller('nfts')
export class NftController {
  constructor(
    private readonly nftCollectionService: NFTCollectionService,
    private readonly nftInfoService: NFTInfoService,
    private readonly nftReceiveService: NFTReceiveService,
    private readonly nftOrderService: NFTOrderService,
  ) {}

  @Get('metadata/:id')
  @ApiOkResponse({ type: GetNFTInfoDetailResponseDto })
  @ApiBadRequestResponse({ description: 'NFTInfo not found' })
  async getNFTInfoById(@Param() params: MongoIdDto): Promise<JsonMetadata> {
    const nftInfoId = params.id;
    const nftInfoData = await this.nftInfoService.findOneById(nftInfoId);
    return nftInfoData;
  }

  @Get('users/:walletAddress')
  @CacheTTL(0.1 * 60 * 1000) // 10 seconds
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getNFTByUser(
    @Param('walletAddress') walletAddress: string,
    @UserParams() userParams: IUser,
  ): Promise<GetListCollectionResponseDto> {
    if (walletAddress !== userParams.walletAddress)
      throw new UnauthorizedException('Unauthorized');

    const userNFTData = await this.nftReceiveService.getUserNFTByWalletAddress(
      userParams.walletAddress,
    );

    let collections: Array<string | INFTCollection>;
    collections = userNFTData.flatMap((_item) =>
      _item.grouping
        .filter((_grouping) => _grouping.group_key === 'collection')
        .map((_grouping) => _grouping.group_value),
    );
    collections = await this.nftCollectionService.find({
      address: {
        $in: collections as Array<string>,
      },
    });

    for (const _collection of collections as Array<INFTCollection>) {
      // filter nft of collection
      const _userNFTData = userNFTData.filter((_item) => {
        const _nftCollectionAddress = new Set(
          _item.grouping
            .filter((_grouping) => _grouping.group_key === 'collection')
            .map((_grouping) => _grouping.group_value),
        );

        return _nftCollectionAddress.has(_collection.address);
      });

      this.nftCollectionService.checkOwnedByWalletAddress(
        _collection,
        _userNFTData,
      );
    }

    await this.nftOrderService.checkIsListing(
      userParams.walletAddress,
      collections as INFTCollection[],
    );

    return {
      totalItems: collections.length,
      pageIndex: 1,
      pageSize: collections.length,
      items: collections as Array<INFTCollection>,
    };
  }

  @Get('channel/:channelId')
  @CacheTTL(0.1 * 60 * 1000) // 10 seconds
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getChannelCollection(
    @Param('channelId') channelId: string,
    @UserParams() userParams: IUser,
  ): Promise<GetListCollectionResponseDto> {
    const channelCollectionData = await this.nftCollectionService.find({
      channel_id: new Types.ObjectId(channelId),
    });

    for (const _collection of channelCollectionData) {
      const userNFTData =
        await this.nftCollectionService.getUserNFTByCollection(
          _collection.address,
          userParams.walletAddress,
        );
      this.nftCollectionService.checkOwnedByWalletAddress(
        _collection,
        userNFTData,
      );
    }

    await this.nftOrderService.checkIsListing(
      userParams.walletAddress,
      channelCollectionData,
    );

    return {
      totalItems: channelCollectionData.length,
      pageIndex: 1,
      pageSize: channelCollectionData.length,
      items: channelCollectionData,
    };
  }

  @Post('users/request-exchange')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async userRequestExchangeCollection(
    @Body() payload: RequestExchangeCollectionDto,
    @UserParams() userParams: IUser,
  ): Promise<RequestExchangeCollectionResponseDto> {
    return await this.nftCollectionService.requestExchangeCollection(
      payload,
      userParams,
    );
  }

  @Post('users/confirm-exchange')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async userConfirmExchangeCollection(
    @Body() payload: ConfirmExchangeCollectionDto,
    @UserParams() userParams: IUser,
  ): Promise<any> {
    await this.nftCollectionService.userConfirmExchange(payload, userParams);

    return { message: 'Exchange collection to reward successful' };
  }

  @Post('listing-order')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async listingNFTOrder(
    @Body() payload: any,
    @UserParams() userParams: IUser,
  ): Promise<any> {
    await this.nftOrderService.listingOrder(payload, userParams);
    return { message: 'Listing successfully' };
  }

  @Get('market-orders')
  async marketOrder(@Query() query: GetListOrderDto): Promise<any> {
    const result = await this.nftOrderService.getListOrder(query);
    return { message: 'success', data: result };
  }

  @Post('market-buy-order')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async marketBuyOrder(
    @Body() payload: any,
    @UserParams() userParams: IUser,
  ): Promise<any> {
    const result = await this.nftOrderService.transferNft(payload, userParams);
    return { message: 'success', data: result };
  }

  @Post('market-cancel-order')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async marketCancelOrder(@Body() payload: any, @UserParams() userParams: IUser): Promise<any> {
    const result = await this.nftOrderService.cannelListing(payload, userParams);
    return { message: 'success', data: [] };
  }
}
