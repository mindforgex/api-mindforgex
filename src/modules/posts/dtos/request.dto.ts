import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/post.constant';
import { Task } from 'src/modules/tasks/models/task.model';

export class GetListPostDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class CreatePostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  channelId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tasks: Task[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  file: string;
}

export class UpdatePostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  channelId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tasks: Task[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  file: string;
}
