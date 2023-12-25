import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { GetListScheduleResponseDto } from './dtos/response.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomError } from 'src/exceptions/custom-error.exception';
import { FileValidation } from 'src/helper/FileValidation';

@ApiTags('schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('')
  @ApiOkResponse({ type: GetListScheduleResponseDto })
  async getListSchedule(
    @Query() query: GetListScheduleDto,
  ): Promise<PageDto<any>> {
    const result = await this.scheduleService.getListSchedule(query);
    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: SuccessResponseDto })
  async getSchedule(@Param('id') scheduleId: string): Promise<any> {
    const result = await this.scheduleService.findOneById(scheduleId);
    return result;
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SuccessResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async createSchedule(
    @Body() dataSchedule: CreateScheduleDto,
    @UserParams() userParams: IUser,
    @UploadedFile(FileValidation.validateFileOptions({ fileIsRequired: true }))
    file?: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    dataSchedule.file = file;
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
  @UseInterceptors(FileInterceptor('file'))
  async updateSchedule(
    @Param('id') scheduleId: string,
    @Body() schedule: UpdateScheduleDto,
    @UserParams() userParams: IUser,
    @UploadedFile(FileValidation.validateFileOptions({}))
    file?: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    schedule.file = file;
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
