import { Controller, Get, Query, Res, UseGuards, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { GetListPostDto } from './dtos/request.dto';
import {
  GetListPostResponseDto,
  PostDetailResponseDto,
} from './dtos/response.dto';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
// import { Role } from 'src/modules/users/constants/user.constant';
import { PostService } from './services/post.service';
import { MongoIdDto } from 'src/common/classes';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetListPostResponseDto })
  @Get('')
  async getListPost(@Query() query: GetListPostDto): Promise<any> {
    const result = await this.postService.getListPost(query);

    return result;
  }

  @Get('/:id')
  @ApiOkResponse({ type: PostDetailResponseDto })
  @ApiBadRequestResponse({ description: 'Post not found' })
  async getPostById(@Param() params: MongoIdDto): Promise<any> {
    return this.postService.findOneById(params.id);
  }
}
