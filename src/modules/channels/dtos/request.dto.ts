import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/channel.constant';
import { REGEX_VALIDATOR } from 'src/common/constants';
import { UserType } from 'src/modules/users/constants/user.constant';

export class GetListChannelDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class GetListOrderDto extends PaginateDto {
  @ApiProperty({ default: 'LATEST_UPDATE' })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;
}

export class GenTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class DonateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tx: string;
}

export class CreateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  userType: UserType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(REGEX_VALIDATOR.EMAIL)
  @MaxLength(100)
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nickName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(18)
  age: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(REGEX_VALIDATOR.URL)
  @MaxLength(255)
  discord: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(REGEX_VALIDATOR.URL)
  @MaxLength(255)
  youtube: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(REGEX_VALIDATOR.URL)
  @MaxLength(255)
  x: string;
}
