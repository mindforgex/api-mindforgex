import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService } from 'src/modules/base/services/base.service';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { Comment, CommentDocument } from '../models/comment.model';
import {
  CreateCommentDto,
  GetListCommentDto,
  UpdateCommentDto,
} from '../dtos/request.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { SORT_CONDITION } from '../constants/comment.constant';
import { User } from 'src/modules/users/models/user.model';
import { Post } from 'src/modules/posts/models/post.model';

@Injectable()
export class CommentService extends BaseService<CommentDocument> {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {
    super(commentModel);
  }

  private readonly defaultSelectFields: string = '';

  private makeFilterCondition = (queryParams: GetListCommentDto) => {
    const { pageIndex, pageSize, sortCondition, ...params } = queryParams;
    const { postId, ...condition } = params;
    return {
      commentParentId: null,
      ...(postId && { postId: new Types.ObjectId(postId) }),
      ...condition,
    };
  };

  private makeSortCondition = (sortCondition: string | undefined) =>
    SORT_CONDITION[sortCondition] || SORT_CONDITION.OLDEST_CREATE;

  async getAllWithPagination(
    queryParams: GetListCommentDto,
    querySelect?: string,
  ) {
    const { pageIndex, pageSize, sortCondition } = queryParams;

    const select = querySelect || this.defaultSelectFields,
      populates = [
        {
          path: 'userId',
        },
        {
          path: 'childComments',
          model: Comment.name,
          populate: { path: 'userId' },
        },
      ];

    const collections = await this.commentModel
      .find(this.makeFilterCondition(queryParams))
      .sort(this.makeSortCondition(sortCondition))
      .skip(Math.max(pageSize * (pageIndex - 1), 0))
      .limit(pageSize)
      .select(select)
      .populate(populates)
      .lean();

    return { pageIndex, pageSize, items: collections };
  }

  public async countItems(queryParams: GetListCommentDto) {
    const totalItems = await this.commentModel.countDocuments(
      this.makeFilterCondition(queryParams),
    );

    return totalItems;
  }

  public async getListComment(
    queryParams: GetListCommentDto,
  ): Promise<PageDto<any>> {
    const [{ items }, totalItems] = await Promise.all([
      this.getAllWithPagination(queryParams),
      this.countItems(queryParams),
    ]);

    const pageMeta = new PageMetaDto({ options: queryParams, totalItems });
    return new PageDto(items, pageMeta);
  }

  async createComment(
    dataComment: CreateCommentDto,
    user: IUser,
  ): Promise<Comment> {
    const { _id: userId } = user;
    const { postId, tagUserId, commentParentId, content } = dataComment;
    const comment = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      ...(tagUserId && { tagUserId: new Types.ObjectId(tagUserId) }),
      ...(commentParentId && {
        commentParentId: new Types.ObjectId(commentParentId),
      }),
      content,
    });

    await this.commentModel.findByIdAndUpdate(commentParentId, {
      $push: { childComments: comment._id },
    });

    await this.postModel.findOneAndUpdate(
      { _id: postId },
      {
        $inc: { amountComment: 1 },
      },
    );

    return comment;
  }

  async updateComment(
    dataComment: UpdateCommentDto,
    commentId: string,
    // user: IUser,
  ): Promise<Comment> {
    // const { _id: userId } = user;
    const { content } = dataComment;

    // EXPLAIN: Update comment
    const updateComment = await this.commentModel.findOneAndUpdate(
      {
        _id: commentId,
        userId: new Types.ObjectId('65892d6bf6ebe2ad53fdf62f'),
      },
      {
        content,
      },
    );
    return updateComment;
  }
}
