import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  UseGuards,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  GetListChannelDto,
  GenTransactionDto,
  DonateChannelDto,
  CreateChannelDto,
} from './dtos/request.dto';
import {
  GetListChannelResponseDto,
  ChannelDetaitResponseDto,
} from './dtos/response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ChannelService } from './services/channel.service';
import { MongoIdDto } from 'src/common/classes';
import { Role } from 'src/modules/channels/constants/channel.constant';
import { UserParams } from 'src/decorators/user-params.decorator';
import { SuccessResponseDto } from 'src/common/dto/success.response.dto';
import { IUser } from '../users/interfaces/user.interface';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('')
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetListChannelResponseDto })
  // @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getListChannel(@Query() query: GetListChannelDto): Promise<any> {
    const result = await this.channelService.getListChannel(query);

    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: ChannelDetaitResponseDto })
  @ApiBadRequestResponse({ description: 'Channel not found' })
  // @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getChannelById(@Param() params: MongoIdDto): Promise<any> {
    const channelId = params.id;

    return await this.channelService.findOneById(channelId);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async createChannel(
    @Body() channel: CreateChannelDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const createChannel = await this.channelService.createChannel(channel, userParams);
    return new SuccessResponseDto(createChannel);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async subscribeChannel(
    @Param('id') channelId: string,
    @UserParams() requestData,
  ): Promise<any> {
    const result = await this.channelService.subscribe(channelId, requestData);

    return { message: 'Subscribed successfully' };
  }

  @Post(':id/gen_transaction')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async genTransaction(
    @Param('id') channelId: string,
    @UserParams() requestData,
    @Body() body: GenTransactionDto,
  ): Promise<any> {
    const result = await this.channelService.genTransaction(
      channelId,
      requestData,
      body,
    );

    return { transaction: result };
  }

  @Post(':id/donate')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async donateToChannel(
    @Param('id') channelId: string,
    @UserParams() requestData,
    @Body() body: DonateChannelDto,
  ): Promise<any> {
    const result = await this.channelService.donateToChannel(
      channelId,
      requestData,
      body,
    );

    return { message: 'Donate To Channel Successfully' };
  }
}
