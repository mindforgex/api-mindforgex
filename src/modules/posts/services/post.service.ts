import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import { NFTInfo } from 'src/modules/nfts/models/nft-info.model';
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
    const conditions = { ...queryParams };

    // const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all();
    const posts = await this.postModel.find(conditions);

    return posts;
  }

  public async createMultiPosts(channelId: string, dataArray: any[]) {
    try {
      const posts = await this.postModel.create(
        dataArray.map((data) => ({ ...data, channel: channelId })),
      );
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

  public async getPostById(postId: string) {
    const post = await this.postModel
      .findById(postId)
      .populate<{ nftId: { _id: Types.ObjectId } & NFTInfo }>('nftId');

    return post;
  }
}
