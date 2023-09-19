import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetListUserDto } from './dtos/request.dto';
import { GetListUserResponseDto } from './dtos/response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/modules/users/constants/user.constant';
import { UserService } from './services/user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetListUserResponseDto })
  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard(Role.admin))
  async getListUser(
    @Query() query: GetListUserDto,
  ): Promise<any> {
    return [];
  }

  
}
