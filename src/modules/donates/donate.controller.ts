import {
    Controller,
    Post,
    Get,
    Query,
    Res,
    UseGuards,
    Param,
    Body,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiTags,
    ApiBadRequestResponse,
  } from '@nestjs/swagger';
  import { GetListDonateDto } from './dtos/request.dto';
  import {
    GetListDonateResponseDto,
    DonateDetaitResponseDto,
  } from './dtos/response.dto';
  import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
  import { RolesGuard } from 'src/guards/roles.guard';
  import { DonateService } from './services/donate.service';
  import { IDonate } from './interfaces/donate.interface';
  import { MongoIdDto } from 'src/common/classes';
  // import { Role } from 'src/modules/donates/constants/donate.constant';
  import { UserParams } from 'src/decorators/user-params.decorator';

  @ApiTags('donates')
  @Controller('donates')
  export class DonateController {
    constructor(private readonly donateService: DonateService) {}

    @Get('/list_donate_by_user/:userWallet')
    @ApiBearerAuth('jwt')
    @ApiOkResponse({ type: GetListDonateResponseDto })
    // @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
    async getListDonateByUser(
      @Param('userWallet') userWallet: string,
    ): Promise<any> {
      const result = await this.donateService.getListDonateByUser(userWallet);

      return result;
    }

    @Get('/list_donate_by_channeel/:channelId')
    @ApiBearerAuth('jwt')
    @ApiOkResponse({ type: GetListDonateResponseDto })
    // @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
    async getListDonateByChannel(
      @Param('channelId') channelId: string,
    ): Promise<any> {
      const result = await this.donateService.getListDonateByChannel(channelId);

      return result;
    }
  }
