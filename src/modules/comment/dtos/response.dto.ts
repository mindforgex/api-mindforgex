import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';
import { Comment } from '../models/comment.model';

export class GetListCommentResponseDto extends PaginateResponseDto<Comment> {}
export class CommentDetailResponseDto extends MongoItemDto<Comment> {}
