import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service.js';
import { PartnerAuthController } from './partner-auth.controller.js';
import { DeliveriesController } from './deliveries.controller.js';

@Module({
  controllers: [PartnerAuthController, DeliveriesController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
