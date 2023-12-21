import { Body, Controller, Get, Param, Post, UseGuards, Query, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TaskDetailResponseDto } from './dtos/response.dto';

import { PostService } from '../posts/services/post.service';
import { TaskService } from './services/task.service';
import { ChannelService } from '../channels/services/channel.service';
import { MongoIdDto } from 'src/common/classes';
import { Role } from 'src/modules/users/constants/user.constant';

import { UserParams } from 'src/decorators/user-params.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { google } from 'googleapis';
import { SuccessResponseDto } from 'src/common/dto/success.response.dto';
import { IUser } from '../users/interfaces/user.interface';
import { CreateTaskDto, UpdateTaskDto } from './dtos/request.dto';

const scopes: any = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirect = process.env.GOOGLE_REDIRECT_URL;

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  private oauth2Client: any;
  constructor(
    private readonly taskService: TaskService,
    private readonly postService: PostService,
    private readonly channelService: ChannelService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      googleId,
      googleSecret,
      googleRedirect
    );
  }

  @Get('/verify-youtube/authenticate-url')
  async getUrl() {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      redirect_uri: googleRedirect
    });
    return { data: url, message: 'success' };
  }

  @Get('/verify-youtube/google/callback')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async googleCallback(
    @Query() query: any,
    @UserParams() requestData
  ) {
    const { tokens } = await this.oauth2Client.getToken(query?.code)
    this.oauth2Client.setCredentials(tokens);

    // store data
    this.taskService.storeUserInfoSubscribe(requestData, tokens);

    return { message: `Authenticate success` };
  }

  @Post('/verify-youtube')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async verifyYoutube(
    @Param('id') channelId: string,
    @UserParams() requestData
  ) {
    const verifyYoutubeInfo = await this.taskService.getVerifyYoutubeInfoByUser(requestData);

    const tokens = verifyYoutubeInfo.tokens;
    this.oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });

    const { data: { items } } = await youtube.channels.list({
      "part": [
        "snippet,contentDetails"
      ],
      mine: true
    });

    const [myChannel] = items;

    // Trong model channel chua co thong tin youtube_channel_id
    const channel = this.channelService.findOneById(channelId);

    const res = await youtube.subscriptions.list({
      "part": [
        "snippet,contentDetails"
      ],
      "channelId": myChannel.id,
      "forChannelId": "UCndcERoL9eG-XNljgUk1Gag",
    });

    if (res.data.items.length > 0) {
      return { code: 200, message: `Verify success` };
    }

    return { code: 400, message: `Not verify` };
  }

  @Get('/:id')
  @ApiOkResponse({ type: TaskDetailResponseDto })
  @ApiBadRequestResponse({ description: 'Task not found' })
  async getTaskById(@Param() params: MongoIdDto): Promise<any> {
    return this.taskService.findOneById(params.id);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.commonUser))
  async verifyTask(
    @Param('id') taskId: string,
    @UserParams() requestData,
    @Body() body: any,
  ): Promise<any> {
    const { taskType, taskInfo } = await this.taskService.findOneById(taskId);

    await this.taskService.verify(
      taskId,
      taskType,
      taskInfo,
      requestData,
      body,
    );

    return { message: `Verify success` };
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async createTask(
    @Body() dataTask: CreateTaskDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const created = await this.taskService.createTask(dataTask, userParams);
    return new SuccessResponseDto(created);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateTask(
    @Param('id') taskId: string,
    @Body() task: UpdateTaskDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const isUpdated = await this.taskService.updateTask(
      task,
      taskId,
      userParams,
    );
    return new SuccessResponseDto(isUpdated);
  }
}
