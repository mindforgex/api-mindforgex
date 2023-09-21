import { Controller, Get, Query, Res, UseGuards, Param } from '@nestjs/common';
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

@ApiTags('posts')
@Controller('posts')
export class TaskController {
  constructor(private readonly postService: TaskService) {}

  @Get('/:id')
  @ApiOkResponse({ type: TaskDetailResponseDto })
  @ApiBadRequestResponse({ description: 'Post not found' })
  async getPostById(@Param() params: MongoIdDto): Promise<any> {
    return this.postService.findOneById(params.id);
  }
}
