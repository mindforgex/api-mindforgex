import { Controller, Get, Post, Query, Res, UseGuards, Param, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { GetListTaskDto } from './dtos/request.dto';
import {
  GetListTaskResponseDto,
  TaskDetailResponseDto,
} from './dtos/response.dto';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { TaskService } from './services/task.service';
import { MongoIdDto } from 'src/common/classes';

import { Role } from 'src/modules/channels/constants/channel.constant';
import { UserParams } from 'src/decorators/user-params.decorator';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

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
    @Body() body,
  ): Promise<any> {
    const result = await this.taskService.verify(taskId, requestData, body);

    return { message: 'Verify successfully' };
  }
}
