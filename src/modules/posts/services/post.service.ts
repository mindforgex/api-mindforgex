import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import {
  SORT_CONDITION,
} from '../constants/post.constant';

import { BaseService } from 'src/modules/base/services/base.service';

import { Post, PostDocument } from '../models/post.model';

@Injectable()
export class PostService extends BaseService<PostDocument> {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {
    super(postModel);
  }

  private readonly defaultSelectFields: string = '';
  public async getListPost(queryParams: any) {
    const conditions = { ...queryParams};

    // const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all();
    const posts = await this.postModel.find().exec();

    return posts;
  }

  public async createMultiPosts(channelId: string, dataArray: any[]) {
    try {
      // Tạo nhiều bài viết cho kênh có channelId cụ thể
      const posts = await this.postModel.create(dataArray.map((data) => ({ ...data, channel: channelId })));
      return posts;
    } catch (error) {
      throw new Error(`Error creating posts: ${error.message}`);
    }
  }

  public async clearPosts() {
    try {
      // Delete all channels info
      await this.postModel.deleteMany({});
    } catch (error) {
      throw new Error(`Error clearing channels: ${error.message}`);
    }
  }

  public async getListPostByChannelId(channelId: string) {
    try {
      const posts = await this.postModel.find({ channel: channelId }).exec();
      return posts;
    } catch (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
    }
  }

  public findOneById = (postId: string, selectFields?: string) =>
  this.postModel
    .findOne({ _id: postId }, selectFields ?? this.defaultSelectFields)
    .lean();
}
