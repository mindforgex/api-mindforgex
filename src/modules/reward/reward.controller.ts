import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/common/cache';

import { GetListRewardHistoryResponseDto } from './dtos/response.dto';

import { UserParams } from 'src/decorators/user-params.decorator';
import { Role } from 'src/modules/users/constants/user.constant';
import { IUser } from 'src/modules/users/interfaces/user.interface';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

import { RewardHistoryService } from './services/reward-history.service';
import { RewardService } from './services/reward.service';
// import { IRewardHistory } from './interfaces/reward.interface';

// import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('rewards')
@Controller('rewards')
export class RewardController {
  constructor(
    private readonly rewardService: RewardService,
    private readonly rewardHistoryService: RewardHistoryService,
  ) {}
  @Get('history/users')
  @CacheTTL(0.1 * 60 * 1000) // 10 sec
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async getNFTByUser(
    @UserParams() userParams: IUser,
  ): Promise<GetListRewardHistoryResponseDto> {
    const userNFTData = await this.rewardHistoryService.findByUserId(
      userParams._id.toString(),
    );

    return {
      totalItems: userNFTData.length,
      pageIndex: 1,
      pageSize: userNFTData.length,
      items: userNFTData,
    };
  }
}
