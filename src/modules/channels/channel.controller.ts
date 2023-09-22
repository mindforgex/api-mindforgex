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
import { GetListChannelDto } from './dtos/request.dto';
import {
  GetListChannelResponseDto,
  ChannelDetaitResponseDto,
} from './dtos/response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ChannelService } from './services/channel.service';
import { IChannel } from './interfaces/channel.interface';
import { MongoIdDto } from 'src/common/classes';
import { Role } from 'src/modules/channels/constants/channel.constant';
import { UserParams } from 'src/decorators/user-params.decorator';

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

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async subscribeChannel(
    @Param('id') channelId: string,
    @UserParams() requestData,
  ): Promise<any> {
    const result = await this.channelService.subscribe(channelId, requestData);

    return { message: 'Subscribed successfully' };
  }
}
