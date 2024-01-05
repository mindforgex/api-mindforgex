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
  IsDateString,
} from 'class-validator';

import { PaginateDto } from 'src/common/classes';

import { SORT_CONDITION } from '../constants/channel.constant';
import { REGEX_VALIDATOR } from 'src/common/constants';
import { UserType } from 'src/modules/users/constants/user.constant';
import { Sex } from '../interfaces/channel.interface';

export class GetListChannelDto extends PaginateDto {
  @ApiProperty({ default: SORT_CONDITION.LATEST_UPDATE })
  @IsOptional()
  @IsIn(Object.keys(SORT_CONDITION))
  sortCondition: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  textSearch: string;
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
  @IsOptional()
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
  channelName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  // @Min(18)
  dateOfBirth: Date;

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

  @ApiPropertyOptional()
  @IsOptional()
  file: Express.Multer.File;
}

export class UpdateChannelDto {
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
  channelName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  founded: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  mainGame: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profestionalFeild: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sex: Sex;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  // @Min(18)
  dateOfBirth: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  aboutMe: string;

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
  @IsNumber()
  followerYoutube: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(REGEX_VALIDATOR.URL)
  @MaxLength(255)
  x: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  followerTwitter: number;
}

export class UpdateAboutMeChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  aboutMe: string;
}
