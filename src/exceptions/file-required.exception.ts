import { NotFoundException } from '@nestjs/common';

export class FileRequiredException extends NotFoundException {
  constructor(error?: string) {
    super('File is required', error);
  }
}
