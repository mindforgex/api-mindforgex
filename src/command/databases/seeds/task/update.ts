import { INestApplicationContext, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from 'src/modules/posts/post.module';
import { PostService } from 'src/modules/posts/services/post.service';
import { TASK_TYPE } from 'src/modules/tasks/constants/task.constant';
import { TaskService } from 'src/modules/tasks/services/task.service';
import { TaskModule } from 'src/modules/tasks/task.module';

@Module({
  imports: [
    TaskModule,
    PostModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const updateTask = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  const taskService = app.get(TaskService);
  const postService = app.get(PostService);

  // await taskService.updateAll(
  //   { taskType: TASK_TYPE.JOIN_DISCORD },
  //   {
  //     taskInfo: {
  //       title: 'MindForgeX',
  //       link: 'https://discord.gg/ZzUdMn6t',
  //       serverId: '1161246114511601674',
  //     },
  //   },
  // );

  // const posts = await postService.getListPost({});
  // const taskData = posts.map((_post) => ({
  //   postId: _post._id,
  //   name: 'Subscribe Twitch channel',
  //   description:
  //     'Subscribe my channel to get the newest information and rewards',
  //   userAddress: [],
  //   taskType: TASK_TYPE.SUBSCRIBE_TWITCH,
  //   taskInfo: {
  //     title: 'RelaxBeats',
  //     link: 'https://www.twitch.tv/relaxbeats',
  //     serverId: 'relaxbeats',
  //   },
  // }));
  // const tasks = await taskService.createMultiTasks(taskData);
  // await Promise.all(
  //   tasks.map((_task) => {
  //     // change postService.postModel to public
  //     return postService.postModel.updateOne(
  //       { _id: _task.postId },
  //       { $push: { tasks: _task._id } },
  //     );
  //   }),
  // );

  await app.close();
  process.exit(0);
};

updateTask();
