import { Body, Controller, Post, Logger } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  UserChangePasswordDto,
  UserRequestForgotPasswordDto,
  UserResetPasswordDto,
  UserSigninDto,
  UserSigninGoogleDto,
  UserSigninTwitterDto,
  UserSignupDto,
} from './dtos/request.dto';
import {
  UserChangePasswordResponseDto,
  UserRequestForgotPasswordResponseDto,
  UserResetPasswordResponseDto,
  UserSignInResponseDto,
  UserSignupResponseDto,
} from './dtos/response.dto';

import { DEFAULT_RESPONSE_SUCCESS } from 'src/common/constants';

import { AuthService } from './services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOkResponse({ type: UserSignupResponseDto })
  @ApiBadRequestResponse({ description: 'User is already exist.' })
  async signup(@Body() body: UserSignupDto): Promise<UserSignupResponseDto> {
    const { email, password } = body;
    const { accessToken, user } = await this.authService.signup(
      email,
      password,
    );

    return {
      accessToken,
      user,
    };
  }

  @Post('signin')
  @ApiOkResponse({ type: UserSignInResponseDto })
  @ApiNotFoundResponse({ description: 'User is not found.' })
  @ApiBadRequestResponse({ description: 'Wrong password.' })
  async signin(@Body() body: UserSigninDto): Promise<UserSignInResponseDto> {
    const { email, password } = body;
    const { accessToken, user } = await this.authService.signin(
      email,
      password,
    );

    return {
      accessToken,
      user,
    };
  }

  @Post('signin/google')
  @ApiOkResponse({ type: UserSignInResponseDto })
  async signinGoogle(
    @Body() body: UserSigninGoogleDto,
  ): Promise<UserSignInResponseDto> {
    this.logger.log(`signinGoogle body: ${JSON.stringify(body)}`);
    const { accessToken, user } = await this.authService.signinGoogle(body);

    return {
      accessToken,
      user,
    };
  }

  @Post('signin/twitter')
  @ApiOkResponse({ type: UserSignInResponseDto })
  async signinTwitter(
    @Body() body: UserSigninTwitterDto,
  ): Promise<UserSignInResponseDto> {
    this.logger.log(`signinTwitter body: ${JSON.stringify(body)}`);
    const { accessToken, user } = await this.authService.signinTwitter(body);

    return {
      accessToken,
      user,
    };
  }

  @Post('change-password')
  @ApiOkResponse({ type: UserChangePasswordResponseDto })
  @ApiNotFoundResponse({ description: 'User is not found.' })
  @ApiBadRequestResponse({ description: 'New password is duplicate.' })
  async changePassword(
    @Body() body: UserChangePasswordDto,
  ): Promise<UserChangePasswordResponseDto> {
    const { email, password, newPassword } = body;
    const { accessToken, user } = await this.authService.changePassword(
      email,
      password,
      newPassword,
    );

    return {
      accessToken,
      user,
    };
  }

  @Post('requests/forgot-password')
  @ApiOkResponse({ type: UserRequestForgotPasswordResponseDto })
  @ApiNotFoundResponse({ description: 'User is not found.' })
  async forgotPassword(@Body() body: UserRequestForgotPasswordDto) {
    const { email, lang } = body;
    await this.authService.forgotPassword(email, lang);

    return DEFAULT_RESPONSE_SUCCESS;
  }

  @Post('reset-password')
  @ApiOkResponse({ type: UserResetPasswordResponseDto })
  @ApiNotFoundResponse({ description: 'Password reset token is expired' })
  async resetPassword(@Body() body: UserResetPasswordDto) {
    const { passwordResetToken, newPassword } = body;
    await this.authService.resetPassword(passwordResetToken, newPassword);

    return DEFAULT_RESPONSE_SUCCESS;
  }
}
