import { Logger } from '@nestjs/common';
import { Document, Model } from 'mongoose';

export class BaseService<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  protected readonly logger = new Logger(this.model.name);

  public async usingTransaction(callback: any) {
    const session = await this.model.db.startSession();

    try {
      return await session.withTransaction(async () => {
        const callbackResult = await callback(session);
        return callbackResult;
      });
    } catch (err) {
      this.logger.error(`Transaction error: ${err}`);
      if (session.inTransaction()) await session.abortTransaction();

      throw err;
    } finally {
      session.endSession();
    }
  }
}
