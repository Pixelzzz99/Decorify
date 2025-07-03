import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async reserveItems(cartItems: { productId: number; quantity: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      const reservations = [];

      for (const item of cartItems) {
        // Check if enough stock is available
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true, productName: true },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.productName}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          );
        }

        // Create reservation record
        const reservation = await tx.inventoryReservation.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            reservedAt: new Date(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            status: 'RESERVED',
          },
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        reservations.push(reservation);
      }

      return reservations;
    });
  }

  async commitReservation(reservationId: number) {
    return this.prisma.inventoryReservation.update({
      where: { id: reservationId },
      data: { status: 'COMMITTED' },
    });
  }

  async releaseReservation(reservationId: number) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Restore stock
      await tx.product.update({
        where: { id: reservation.productId },
        data: {
          stockQuantity: {
            increment: reservation.quantity,
          },
        },
      });

      // Mark reservation as released
      await tx.inventoryReservation.update({
        where: { id: reservationId },
        data: { status: 'RELEASED' },
      });
    });
  }

  async cleanupExpiredReservations() {
    const expiredReservations = await this.prisma.inventoryReservation.findMany(
      {
        where: {
          expiresAt: { lt: new Date() },
          status: 'RESERVED',
        },
      }
    );

    for (const reservation of expiredReservations) {
      await this.releaseReservation(reservation.id);
    }

    return { cleaned: expiredReservations.length };
  }
}
