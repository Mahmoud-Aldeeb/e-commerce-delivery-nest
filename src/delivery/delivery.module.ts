import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { PartnerAuthController } from './partner-auth.controller';
import { DeliveriesController } from './deliveries.controller';

@Module({
  controllers: [PartnerAuthController, DeliveriesController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
