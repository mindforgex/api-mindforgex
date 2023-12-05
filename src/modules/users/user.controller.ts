import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { GetListUserDto, ConnectDiscordDto } from './dtos/request.dto';
import { GetListUserResponseDto } from './dtos/response.dto';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

import { Role } from 'src/modules/users/constants/user.constant';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { UserParams } from 'src/decorators/user-params.decorator';

import { UserService } from './services/user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetListUserResponseDto })
  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.admin))
  async getListUser(@Query() query: GetListUserDto): Promise<any> {
    return [];
  }

  @ApiBearerAuth('jwt')
  @Post('sns/discord/connect')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async connectSNS(
    @UserParams() userParams: IUser,
    @Body() body: ConnectDiscordDto,
  ): Promise<any> {
    await this.userService.updateDiscordInfo(
      userParams.walletAddress,
      body.discordId,
      body.discordUsername,
    );

    return { message: 'Success' };
  }

  @ApiBearerAuth('jwt')
  @Put('registrator-token')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async updateToken(
    @UserParams() userParams: IUser,
    @Body() body: { registratorToken: string },
  ): Promise<any> {
    await this.userService.updateToken(userParams.walletAddress, body.registratorToken);
    return { message: 'Success' };
  }
}
