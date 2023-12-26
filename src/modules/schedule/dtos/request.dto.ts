import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginateDto } from 'src/common/classes';
import { SORT_CONDITION } from '../constants/schedule.constant';

export class GetListScheduleDto extends PaginateDto {
  @ApiProperty({ default: { date: -1 } })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  channelId: string;
}

export class CreateScheduleDto {
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
  @MaxLength(500)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  file?: Express.Multer.File;
}

export class UpdateScheduleDto {
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
  @MaxLength(500)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  file?: Express.Multer.File;
}
