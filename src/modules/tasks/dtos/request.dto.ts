import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsNotEmpty } from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/task.constant';

export class GetListTaskDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class TaskSnsDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsOptional()
  link: string;

  @ApiProperty()
  @IsOptional()
  serverId: string;
}
