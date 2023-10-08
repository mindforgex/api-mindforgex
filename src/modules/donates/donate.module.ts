import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonateController } from './donate.controller';
import { DonateService } from './services/donate.service';
import { Donate, DonateSchema } from './models/donate.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Donate.name,
        schema: DonateSchema,
      },
    ]),
  ],
  controllers: [DonateController],
  providers: [DonateService],
  exports: [DonateService],
})
export class DonateModule {}
