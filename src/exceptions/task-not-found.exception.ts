import { NotFoundException } from '@nestjs/common';

export class TaskNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('Task not found', error);
  }
}
