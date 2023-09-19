import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from 'src/common/constants';

export class PaginateDto {
  @ApiProperty({ default: DEFAULT_PAGE_INDEX })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  pageIndex?: number = DEFAULT_PAGE_INDEX;

  @ApiProperty({ default: DEFAULT_PAGE_SIZE })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => Number(value))
  pageSize?: number = DEFAULT_PAGE_SIZE;
}

export class PaginateResponseDto<T> {
  @ApiResponseProperty()
  totalItems: number;

  @ApiResponseProperty()
  pageIndex: number;

  @ApiResponseProperty()
  pageSize: number;

  @ApiProperty({ isArray: true })
  items: T[];
}

export class MongoIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId({
    message: 'Invalid id',
  })
  id: string;
}

export class MongoCollectionIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId({
    message: 'Invalid collection id',
  })
  collectionId: string;
}

export class DefaultResponseDto {
  @ApiResponseProperty({ example: 'Success' })
  message: string;
}
