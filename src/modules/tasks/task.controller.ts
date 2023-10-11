import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TaskDetailResponseDto } from './dtos/response.dto';

import { PostService } from '../posts/services/post.service';
import { TaskService } from './services/task.service';

import { MongoIdDto } from 'src/common/classes';
import { Role } from 'src/modules/users/constants/user.constant';

import { UserParams } from 'src/decorators/user-params.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly postService: PostService,
  ) {}

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
}
