import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserSigninDto {
  @ApiProperty()
  @IsNotEmpty()
  // @Validate(IsValidAddress)
  walletAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}
