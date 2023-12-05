import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/classes';

export const SORT_CONDITION = {
  LATEST_UPDATE: { updatedAt: -1 },
  OLDEST_UPDATE: { updatedAt: 1 },
};

export class InternalNoti extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class UserNotiQuery extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}
