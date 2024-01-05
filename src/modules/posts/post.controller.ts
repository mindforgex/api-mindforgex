import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  CreatePostDto,
  GetListPostDto,
  UpdatePostDto,
} from './dtos/request.dto';
import {
  GetListPostResponseDto,
  PostDetailResponseDto,
} from './dtos/response.dto';

import { MongoIdDto } from 'src/common/classes';
import { UserParams } from 'src/decorators/user-params.decorator';
import { Role } from 'src/modules/users/constants/user.constant';
import { IUser } from 'src/modules/users/interfaces/user.interface';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

import { TaskService } from 'src/modules/tasks/services/task.service';
import { ShyftWeb3Service } from '../base/services/shyft-web3.service';
import { PostService } from './services/post.service';
import { SuccessResponseDto } from 'src/common/dto/success.response.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidation } from 'src/helper/FileValidation';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly taskService: TaskService,
    private readonly shyftWeb3Service: ShyftWeb3Service,
  ) {}

  // @ApiBearerAuth('jwt')
  // @ApiOkResponse({ type: GetListPostResponseDto })
  // @Get('')
  // async getListPost(@Query() query: GetListPostDto): Promise<any> {
  //   const result = await this.postService.getListPost(query);

  //   return result;
  // }

  @Get('')
  @ApiOkResponse({ type: GetListPostResponseDto })
  async getListPost(@Query() query: GetListPostDto): Promise<PageDto<any>> {
    const result = await this.postService.getListPost(query);
    return result;
  }

  @Get('/:id')
  @ApiOkResponse({ type: PostDetailResponseDto })
  @ApiBadRequestResponse({ description: 'Post not found' })
  async getPostById(@Param() params: MongoIdDto): Promise<any> {
    return this.postService.findOneById(params.id);
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @Body() dataPost: CreatePostDto,
    @UserParams() userParams: IUser,
    @UploadedFile(FileValidation.validateFileOptions({ fileIsRequired: true }))
    file?: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    dataPost.file = file;
    const created = await this.postService.createPost(dataPost, userParams);
    return new SuccessResponseDto(created);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async updatePost(
    @Param('id') postId: string,
    @Body() post: UpdatePostDto,
    @UserParams() userParams: IUser,
    @UploadedFile(FileValidation.validateFileOptions({}))
    file?: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    post.file = file;
    const isUpdated = await this.postService.updatePost(
      post,
      postId,
      userParams,
    );
    return new SuccessResponseDto(isUpdated);
  }

  @Post(':id/react')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async react(
    @Param('id') postId: string,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const react = await this.postService.react(
      postId,
      userParams,
    );
    return new SuccessResponseDto(react);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async deletePost(
    @Param('id') postId: string,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const isDelete = await this.postService.deletePost(postId, userParams);
    return new SuccessResponseDto(isDelete);
  }

  @Post(':id/nft/claim')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async mint(@Param() params: MongoIdDto, @UserParams() userParams: IUser) {
    const { walletAddress } = userParams;
    const { id: postId } = params;

    // TODO: isClaimed

    const tasks = await this.taskService.getTasksByPostId(postId);
    if (!tasks.length) throw new BadRequestException('Post has no tasks');

    const isUserCompletedAllTasks = tasks.every((task) =>
      task.userAddress.includes(walletAddress),
    );

    if (!isUserCompletedAllTasks)
      throw new BadRequestException('User has not completed all tasks');

    const post = await this.postService.getPostById(postId);

    const { nftId: nftMetadata, userAddress } = post;

    if (userAddress.includes(walletAddress))
      throw new BadRequestException('User has claimed this post');

    const txnSignature = await this.shyftWeb3Service.mintCNFTToWalletAddress({
      collectionAddress: nftMetadata.nft_collection_address,
      receiverAddress: walletAddress,
      metadataUri: `${process.env.BACKEND_BASE_URL}/v1/nfts/metadata/${nftMetadata._id}`,
    });

    await this.postService.updateUserClaimed(post._id, walletAddress);

    return { txnSignature };
  }
}
