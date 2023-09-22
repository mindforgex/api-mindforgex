import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { mongooseSoftDeletePlugin } from 'src/common/plugins/mongoose-soft-delete.plugin';
import { TaskModule } from 'src/modules/tasks/task.module';

import { PostController } from './post.controller';

import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { PostService } from './services/post.service';

import { Post, PostSchema } from './models/post.model';

@Module({
  imports: [
    TaskModule,
    MongooseModule.forFeature([
      {
        name: Post.name,
        // schema: UserSchema.plugin(mongooseSoftDeletePlugin),
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, ShyftWeb3Service],
  exports: [PostService],
})
export class PostModule {}
