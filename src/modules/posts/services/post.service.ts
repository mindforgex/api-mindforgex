import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/modules/base/services/base.service';

import { NFTInfo } from 'src/modules/nfts/models/nft-info.model';
import { Post, PostDocument } from '../models/post.model';
import { CreatePostDto } from '../dtos/request.dto';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { UserService } from 'src/modules/users/services/user.service';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { UserStatus } from 'src/modules/users/constants/user.constant';
import { ChannelService } from 'src/modules/channels/services/channel.service';
import { ChannelNotFoundException } from 'src/exceptions/channel-not-found.exception';
import { TaskService } from 'src/modules/tasks/services/task.service';
import { LIST_TASK_OPTIONS } from 'src/common/constants';
import { TaskStatus } from 'src/modules/tasks/constants/task.constant';
import { PostNotFoundException } from 'src/exceptions/post-not-found.exception';

@Injectable()
export class PostService extends BaseService<PostDocument> {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly taskService: TaskService,
  ) {
    super(postModel);
  }

  private readonly defaultSelectFields: string = '';

  private makeFilterCondition = ({}) => ({});

  public async getListPost(queryParams: any) {
    // const [{ pageIndex, pageSize, items }, totalItems] = await Promise.all();
    const posts = await this.postModel.find(
      this.makeFilterCondition(queryParams),
    );

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

  public async updateUserClaimed(postId: string, walletAddress: string) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      { $push: { userAddress: walletAddress } },
      { new: true },
    );

    return post;
  }

  async createPost(dataPost: CreatePostDto, user: IUser): Promise<Post> {
    const { _id: userId } = user;
    const { channelId, title, content, tasks, file } = dataPost;

    // EXPLAIN: Check user existence and activity status
    const userExits = await this.userService.findOneByCondition({
      _id: userId,
      status: UserStatus.active,
    });
    if (!userExits) throw new UserNotFoundException();

    // EXPLAIN: Check if the channel exists and if the post is owned by the user
    const channelExits = await this.channelService.findOneByCondition({
      _id: channelId,
      userId: userId,
    });
    if (!channelExits) throw new ChannelNotFoundException();

    // EXPLAIN: Create post
    const post = await this.postModel.create({
      title,
      content,
      channelId: new Types.ObjectId(channelId),
      //TODO: The meaning and logic of creating nftId is unclear
      nftId: new Types.ObjectId('65292c6f68895e7bc014aab5'),
    });

    const formatTasks = LIST_TASK_OPTIONS.map((task) => ({
      postId: post._id,
      taskType: task.taskType,
      name: task.name,
      description: task.description,
      // @ts-ignore
      status: tasks.includes(task.taskType)
        ? TaskStatus.active
        : TaskStatus.inactive,
      //TODO: The meaning and logic of creating taskInfo is unclear
      taskInfo: {
        title: '',
        link: '',
        serverId: '',
      },
    }));
    const createdTasks = await this.taskService.createMultiTasks(formatTasks);
    post.tasks = createdTasks;
    const updatePost = await post.save();
    channelExits.posts = [...channelExits.posts, post.id];
    await channelExits.save();
    return updatePost;
  }

  async updatePost(
    dataPost: CreatePostDto,
    postId: string,
    user: IUser,
  ): Promise<Post> {
    const { _id: userId } = user;
    const { channelId, title, content, tasks, file } = dataPost;

    // EXPLAIN: Check user existence and activity status
    const userExits = await this.userService.findOneByCondition({
      _id: userId,
      status: UserStatus.active,
    });
    if (!userExits) throw new UserNotFoundException();

    // EXPLAIN: Check if the channel exists and if the post is owned by the user
    const channelExits = await this.channelService.findOneByCondition({
      _id: channelId,
      userId: userId,
    });
    if (!channelExits) throw new ChannelNotFoundException();

    // EXPLAIN: Update post
    const updatePost = await this.postModel.findOneAndUpdate(
      { _id: postId, channelId },
      {
        title,
        content,
      },
    );

    // EXPLAIN: Update task
    const formatOptionTasks = LIST_TASK_OPTIONS.map((i) => i.taskType);
    await this.taskService.updateManyTask(
      { postId },
      {
        $set: {
          status: {
            // $cond: {
            //   if: { $in: ['$taskType', formatOptionTasks] },
            //   then: 'a',
            //   else: 'b',
            // },
            $cond: [
              { $in: ['$taskType', formatOptionTasks] },
              TaskStatus.active,
              TaskStatus.inactive,
            ],
          },
        },
      },
    );
    return updatePost;
  }

  async deletePost(postId: string, user: IUser) {
    const { _id: userId } = user;

    // EXPLAIN: Check post existence
    const postExits = await this.findOneById(postId);
    if (!postExits) throw new PostNotFoundException();

    // EXPLAIN: Check if the channel exists and if the post is owned by the user
    const channelExits = await this.channelService.findOneByCondition({
      _id: postExits.channelId,
      userId: userId,
    });
    if (!channelExits) throw new ChannelNotFoundException();

    // Delete the post and the tasks belonging to the post
    const deletePost = await this.postModel.deleteOne({ _id: postId });
    await this.taskService.deleteManyTask({ postId });
    return deletePost;
  }
}
