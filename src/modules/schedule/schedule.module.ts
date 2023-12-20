import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './schedule.controller';
import { Schedule, ScheduleSchema } from './models/schedule.model';
import { ScheduleService } from './services/schedule.service';
import { ChannelModule } from '../channels/channel.module';

@Module({
  imports: [
    ChannelModule,
    MongooseModule.forFeature([
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
