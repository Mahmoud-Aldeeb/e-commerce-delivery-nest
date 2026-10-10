import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StripeService } from '../stripe/stripe.service.js';
import { InngestService } from '../inngest/inngest.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

// Card orders stay hidden until Stripe confirms the payment
export const HIDE_UNPAID_CARD_ORDERS: Prisma.OrderWhereInput = {
  NOT: [{ paymentMethod: 'card', isPaid: false }],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private inngest: InngestService,
  ) {}

  // Background events must never make an already-created order fail
  private async emitEvents(events: Parameters<InngestService['send']>[0]) {
    try {
      await this.inngest.send(events);
    } catch (error) {
      this.logger.error('Failed to send Inngest events', error as Error);
    }
  }

  // POST /api/orders
  async createOrder(userId: string, dto: CreateOrderDto, origin?: string) {
    const { items, shippingAddress, paymentMethod } = dto;

    // Prices always come from the database, never from the client
    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((i) => i.product) } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.product);
      if (!product || (product.stock ?? 0) < item.quantity) {
        throw new NotFoundException('Product out of stock'); // kept as 404 for compatibility
      }
    }

    const orderItems = items.map((item) => {
      const product = productMap.get(item.product)!; // existence checked above
      return {
        product: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
      };
    });

    const subtotal = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    const deliveryFee = subtotal > 500 ? 0 : 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    const order = await this.prisma.order.create({
      data: {
        userId,
        items: orderItems,
        shippingAddress: shippingAddress as Prisma.InputJsonObject,
        paymentMethod,
        subtotal,
        deliveryFee,
        tax,
        total,
        statusHistory: [
          {
            status: 'Placed',
            note: 'Order placed successfully',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });

    if (paymentMethod === 'card') {
      const session = await this.stripe.client.checkout.sessions.create({
        success_url: `${origin}/orders?clearCart=true`,
        cancel_url: `${origin}/checkout`,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Order payment' },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: { orderId: order.id },
      });

      return { url: session.url };
    }

    // Non-card: decrease stock for all items atomically (all succeed or none)
    await this.prisma.$transaction(
      orderItems.map((item) =>
        this.prisma.product.update({
          where: { id: item.product },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    await this.emitEvents([
      ...orderItems.map((item) => ({
        name: 'inventory/stock.updated',
        data: { productId: item.product },
      })),
      { name: 'order/placed', data: { orderId: order.id } },
    ]);

    return { order };
  }

  // GET /api/orders
  async getUserOrders(userId: string, status?: string) {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...HIDE_UNPAID_CARD_ORDERS,
    };
    if (status && status !== 'all') where.status = status;

    const orders = await this.prisma.order.findMany({
      where,
      include: { deliveryPartner: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { orders };
  }

  // GET /api/orders/all (admin)
  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      where: HIDE_UNPAID_CARD_ORDERS,
      include: {
        user: { select: { name: true, email: true } },
        deliveryPartner: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { orders };
  }

  // GET /api/orders/:id
  async getOrder(userId: string, id: string) {
    // Filtering by userId makes other users' orders look like "not found"
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        deliveryPartner: {
          select: { name: true, phone: true, avatar: true, vehicleType: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return { order };
  }

  // PUT /api/orders/:id/status (admin)
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const history: Prisma.InputJsonValue[] = Array.isArray(order.statusHistory)
      ? (order.statusHistory as Prisma.InputJsonValue[])
      : [];

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        statusHistory: [
          ...history,
          {
            status: dto.status,
            note: dto.note || `Order ${dto.status.toLowerCase()}`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });

    return { order: updatedOrder };
  }

  // PUT /api/orders/:id/location
  async getOrderLocation(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      select: { liveLocation: true, status: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    return { liveLocation: order.liveLocation, status: order.status };
  }
}
