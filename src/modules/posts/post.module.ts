import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { mongooseSoftDeletePlugin } from 'src/common/plugins/mongoose-soft-delete.plugin';

import { PostController } from './post.controller';

import { PostService } from './services/post.service';

import { Post, PostSchema } from './models/post.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        // schema: UserSchema.plugin(mongooseSoftDeletePlugin),
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
