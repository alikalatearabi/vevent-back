import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { UsersModule } from '../users/users.module';
import { DiscountCodesModule } from '../discount-codes/discount-codes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule, forwardRef(() => UsersModule), DiscountCodesModule],
  providers: [PaymentsService, PaymentGatewayService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

