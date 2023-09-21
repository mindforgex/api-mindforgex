import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';

import { Post } from '../models/post.model';

export class GetListPostResponseDto extends PaginateResponseDto<Post> {}
export class PostDetailResponseDto extends MongoItemDto<Post> {}
