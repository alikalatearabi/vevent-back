import { Module } from '@nestjs/common';
import { DiscountCodesService } from './discount-codes.service';
import { DiscountCodesController, DiscountCodesAdminController } from './discount-codes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiscountCodesController, DiscountCodesAdminController],
  providers: [DiscountCodesService],
  exports: [DiscountCodesService],
})
export class DiscountCodesModule {}

