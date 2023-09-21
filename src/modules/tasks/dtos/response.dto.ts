import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';

import { Task } from '../models/task.model';

export class GetListTaskResponseDto extends PaginateResponseDto<Task> {}
export class TaskDetailResponseDto extends MongoItemDto<Task> {}
