import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateScheduleDto,
  GetListScheduleDto,
  UpdateScheduleDto,
} from './dtos/request.dto';

import { UserParams } from 'src/decorators/user-params.decorator';
import { IUser } from 'src/modules/users/interfaces/user.interface';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ScheduleService } from './services/schedule.service';
import { SuccessResponseDto } from 'src/common/dto/success.response.dto';
import {
  GetListScheduleResponseDto,
  ScheduleDetailResponseDto,
} from './dtos/response.dto';

@ApiTags('schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('')
  // @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetListScheduleResponseDto })
  async getListChannel(
    @Query() query: GetListScheduleDto,
  ): Promise<GetListScheduleResponseDto> {
    const result = await this.scheduleService.getListSchedule(query);
    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: SuccessResponseDto })
  // @UseGuards(JwtAuthGuard)
  async getSchedule(@Param('id') scheduleId: string): Promise<any> {
    const result = await this.scheduleService.findOneById(scheduleId);
    return result;
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async createSchedule(
    @Body() dataSchedule: CreateScheduleDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const created = await this.scheduleService.createSchedule(
      dataSchedule,
      userParams,
    );
    return new SuccessResponseDto(created);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateSchedule(
    @Param('id') scheduleId: string,
    @Body() schedule: UpdateScheduleDto,
    @UserParams() userParams: IUser,
  ): Promise<SuccessResponseDto> {
    const isUpdated = await this.scheduleService.updateSchedule(
      schedule,
      scheduleId,
      userParams,
    );
    return new SuccessResponseDto(isUpdated);
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // @ApiOkResponse({ type: SuccessResponseDto })
  // async deleteSchedule(
  //   @Param('id') scheduleId: string,
  //   @UserParams() userParams: IUser,
  // ): Promise<SuccessResponseDto> {
  //   const isDelete = await this.scheduleService.deleteSchedule(scheduleId, userParams);
  //   return new SuccessResponseDto(isDelete);
  // }
}
