import { ApiProperty } from '@nestjs/swagger';
import { PaginateDto } from '../classes';

interface PageMetaDtoParameters {
  options: PaginateDto;
  totalItems: number;
}

export class PageMetaDto {
  @ApiProperty()
  readonly pageIndex: number;

  @ApiProperty()
  readonly pageSize: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ options, totalItems }: PageMetaDtoParameters) {
    this.pageIndex = options.pageIndex;
    this.pageSize = options.pageSize;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.hasPreviousPage = this.pageIndex > 1;
    this.hasNextPage = this.pageIndex < this.totalPages;
  }
}
