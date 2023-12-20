import { NotFoundException } from '@nestjs/common';

export class PostNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('Post not found', error);
  }
}
