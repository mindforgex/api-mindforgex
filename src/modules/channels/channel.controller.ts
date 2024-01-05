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
  Put,
  UploadedFile,
  UseInterceptors,
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
  UpdateChannelDto,
  UpdateAboutMeChannelDto,
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
import { FileValidation } from 'src/helper/FileValidation';
import { FileRequiredException } from 'src/exceptions/file-required.exception';
import { FileInterceptor } from '@nestjs/platform-express';
import { PageDto } from 'src/common/dto/page.dto';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('')
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetListChannelResponseDto })
  // @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getListChannel(@Query() query: GetListChannelDto): Promise<PageDto<any>> {
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
  @UseInterceptors(FileInterceptor('file'))
  async createChannel(
    @Body() channel: CreateChannelDto,
    @UserParams() userParams: IUser,
    @UploadedFile(FileValidation.validateFileOptions({}))
    file?: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    channel.file = file;
    const createChannel = await this.channelService.createChannel(
      channel,
      userParams,
    );
    return new SuccessResponseDto(createChannel);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateChannel(
    @Param('id') channelId: string,
    @Body() channel: UpdateChannelDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const isUpdated = await this.channelService.updateChannel(
      channel,
      channelId,
      userParams,
    );
    return new SuccessResponseDto(isUpdated);
  }

  @Put(':id/about_me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateAboutMe(
    @Param('id') channelId: string,
    @Body() data: UpdateAboutMeChannelDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const isUpdated = await this.channelService.updateAboutMe(
      data,
      channelId,
      userParams,
    );
    return new SuccessResponseDto(isUpdated);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async subscribeChannel(
    @Param('id') channelId: string,
    @UserParams() requestData,
  ): Promise<any> {
    const result = await this.channelService.subscribeOrUnSubscribe(
      channelId,
      requestData,
    );

    return { message: result.message };
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
