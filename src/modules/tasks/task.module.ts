import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { mongooseSoftDeletePlugin } from 'src/common/plugins/mongoose-soft-delete.plugin';

import { TaskController } from './task.controller';

import { TaskService } from './services/task.service';

import { Task, TaskSchema } from './models/task.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        // schema: UserSchema.plugin(mongooseSoftDeletePlugin),
        schema: TaskSchema,
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
