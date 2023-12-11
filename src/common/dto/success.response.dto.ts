import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class SuccessResponseDto {
  @ApiProperty()
  readonly status: number;

  @ApiProperty()
  readonly msg: string;

  @ApiProperty()
  readonly data: any;

  constructor(data?: any) {
    this.status = HttpStatus.OK;
    this.msg = 'OK';
    if (data) {
      this.data = data;
    }
  }
}
