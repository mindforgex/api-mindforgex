import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import { MIN_PASSWORD_LENGTH } from 'src/modules/users/constants/user.constant';

export class UserSignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password: string;
}

export class UserSigninDto extends UserSignupDto {}

export class UserSigninGoogleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @ApiProperty()
  @IsString()
  googleDisplayName: string;
}

export class UserSigninTwitterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  twitterId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  twitterUsername: string;
}

export class UserChangePasswordDto extends UserSignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  newPassword: string;
}

export class UserRequestForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['en', 'ja'])
  lang: string;
}

export class UserResetPasswordDto extends PickType(UserChangePasswordDto, [
  'newPassword',
]) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  passwordResetToken: string;
}
