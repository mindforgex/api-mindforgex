import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UserSigninDto } from './dtos/request.dto';
import { UserSignInResponseDto } from './dtos/response.dto';

import { AuthService } from './services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiOkResponse({ type: UserSignInResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid signature.' })
  async signin(@Body() body: UserSigninDto): Promise<UserSignInResponseDto> {
    const { walletAddress, message, signature } = body;
    const { accessToken, user } = await this.authService.signin(
      walletAddress,
      message,
      signature,
    );

    return {
      accessToken,
      user,
    };
  }
}
