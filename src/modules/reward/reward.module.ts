import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RewardController } from './reward.controller';
import { RewardHistoryService } from './services/reward-history.service';
import { RewardService } from './services/reward.service';

import { Reward, RewardSchema } from './models/reward.model';
import {
  RewardHistory,
  RewardHistorySchema,
} from './models/reward-history.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Reward.name,
        schema: RewardSchema,
      },
      {
        name: RewardHistory.name,
        schema: RewardHistorySchema,
      },
    ]),
  ],
  controllers: [RewardController],
  providers: [RewardService, RewardHistoryService],
  exports: [RewardService, RewardHistoryService],
})
export class RewardModule {}
