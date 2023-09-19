import { ApiResponseProperty } from '@nestjs/swagger';

import { DefaultResponseDto } from 'src/common/classes';

export class UserPayloadResponseDto {
  @ApiResponseProperty()
  userId: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  role: string;

  @ApiResponseProperty()
  nonce: number;
}

export class UserSignupResponseDto {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty({ type: UserPayloadResponseDto })
  user: UserPayloadResponseDto;
}

export class UserSignInResponseDto extends UserSignupResponseDto {}

export class UserChangePasswordResponseDto extends UserSignupResponseDto {}

export class UserRequestForgotPasswordResponseDto extends DefaultResponseDto {}

export class UserResetPasswordResponseDto extends DefaultResponseDto {}
