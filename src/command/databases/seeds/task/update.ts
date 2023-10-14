import { INestApplicationContext, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TASK_TYPE } from 'src/modules/tasks/constants/task.constant';
import { TaskService } from 'src/modules/tasks/services/task.service';
import { TaskModule } from 'src/modules/tasks/task.module';

@Module({
  imports: [
    TaskModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const updateTask = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const taskService = app.get(TaskService);

  await taskService.updateAll(
    { taskType: TASK_TYPE.JOIN_DISCORD },
    {
      taskInfo: {
        title: 'MindForgeX',
        link: 'https://discord.gg/ZzUdMn6t',
        serverId: '1161246114511601674',
      },
    },
  );

  await app.close();
  process.exit(0);
};

updateTask();
