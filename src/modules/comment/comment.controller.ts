import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateCommentDto,
  GetListCommentDto,
  UpdateCommentDto,
} from './dtos/request.dto';

import { UserParams } from 'src/decorators/user-params.decorator';
import { IUser } from 'src/modules/users/interfaces/user.interface';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { SuccessResponseDto } from 'src/common/dto/success.response.dto';
import { CommentService } from './services/comment.service';
import { GetListCommentResponseDto } from './dtos/response.dto';
import { PageDto } from 'src/common/dto/page.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('')
  @ApiOkResponse({ type: GetListCommentResponseDto })
  async getListComment(
    @Query() query: GetListCommentDto,
  ): Promise<PageDto<any>> {
    const result = await this.commentService.getListComment(query);
    return result;
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async createComment(
    @Body() dataComment: CreateCommentDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const created = await this.commentService.createComment(
      dataComment,
      userParams,
    );
    return new SuccessResponseDto(created);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateComment(
    @Param('id') commentId: string,
    @Body() comment: UpdateCommentDto,
    // @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const isUpdated = await this.commentService.updateComment(
      comment,
      commentId,
      // userParams,
    );
    return new SuccessResponseDto(isUpdated);
  }
}
