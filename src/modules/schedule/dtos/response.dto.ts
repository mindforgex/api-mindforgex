import { PaginateResponseDto, MongoItemDto } from 'src/common/classes';
import { Schedule } from '../models/schedule.model';

export class GetListScheduleResponseDto extends PaginateResponseDto<Schedule> {}
export class ScheduleDetailResponseDto extends MongoItemDto<Schedule> {}
