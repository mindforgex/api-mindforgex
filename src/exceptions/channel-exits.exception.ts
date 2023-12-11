import { NotFoundException } from '@nestjs/common';

export class ChannelExitsException extends NotFoundException {
  constructor(error?: string) {
    super('Channel exits', error);
  }
}
