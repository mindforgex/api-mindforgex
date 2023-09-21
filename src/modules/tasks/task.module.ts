import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './task.controller';
import { TaskService } from './services/task.service';
import { Task, TaskSchema } from './models/task.model';
import { ChannelService } from '../channels/services/channel.service';
import { Channel, ChannelSchema } from '../channels/models/channel.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: Channel.name,
        schema: ChannelSchema,
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService, ChannelService],
  exports: [TaskService, ChannelService],
})
export class TaskModule {}
