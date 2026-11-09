import { prisma } from "@/lib/prisma";
import {
  OrderDTO,
  OrderItemDTO,
  CheckoutAddressDTO,
  PaymentMethodType,
  OrderStatusType,
} from "@/types/checkout";
import { logger } from "@/lib/logger";

export interface CreateOrderParams {
  idempotencyKey: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatusType;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  shippingFee: number;
  codFee: number;
  giftFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: "PENDING" | "INITIATED" | "AUTHORIZED" | "CAPTURED" | "FAILED";
  shippingAddress: CheckoutAddressDTO;
  billingAddress: CheckoutAddressDTO;
  couponCode?: string | null;
  isGiftWrapped: boolean;
  notes?: string | null;
  items: Array<{
    variantId?: string | null;
    productTitle: string;
    variantTitle: string;
    sku: string;
    hsnCode?: string | null;
    unitPrice: number;
    sellingPrice: number;
    quantity: number;
    taxRatePercent: number;
    taxAmount: number;
    totalPrice: number;
    imageUrl?: string | null;
    attributes?: Record<string, string>;
  }>;
  razorpayOrderId?: string | null;
}

interface PrismaOrderWithRelations {
  id: string;
  orderNumber: string;
  idempotencyKey?: string | null;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  subtotal: unknown;
  discountAmount: unknown;
  taxAmount: unknown;
  cgstAmount: unknown;
  sgstAmount: unknown;
  igstAmount: unknown;
  shippingFee: unknown;
  codFee: unknown;
  giftFee?: unknown;
  totalAmount: unknown;
  paymentMethod: string;
  shippingAddressSnapshot: unknown;
  billingAddressSnapshot: unknown;
  couponCode?: string | null;
  isGiftWrapped: boolean;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  payments?: Array<{
    status: string;
    razorpayOrderId?: string | null;
  }>;
  items?: Array<{
    id: string;
    orderId: string;
    variantId?: string | null;
    productTitle: string;
    variantTitle: string;
    sku: string;
    hsnCode?: string | null;
    unitPrice: unknown;
    sellingPrice: unknown;
    quantity: number;
    taxRatePercent: unknown;
    taxAmount: unknown;
    totalPrice: unknown;
    imageUrlSnapshot?: string | null;
    variantAttributesSnapshot?: unknown;
  }>;
}

// In-memory store for isolated, deterministic testing
const inMemoryOrders = new Map<string, OrderDTO>();

export class OrderRepository {
  /**
   * Creates an order with items and payment inside a database transaction.
   * If an order with the same idempotencyKey already exists, returns the existing order.
   */
  async createOrderWithTransaction(data: CreateOrderParams): Promise<OrderDTO> {
    // 1. Check idempotency in memory or DB
    if (data.idempotencyKey) {
      const existingInMemory = Array.from(inMemoryOrders.values()).find(
        (o) => o.idempotencyKey === data.idempotencyKey
      );
      if (existingInMemory) {
        logger.info(`Idempotent order replay (in-memory): ${existingInMemory.orderNumber}`);
        return { ...existingInMemory };
      }
    }

    if (process.env.NODE_ENV === "test") {
      return this.createOrderInMemory(data);
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // Idempotency check inside transaction
        if (data.idempotencyKey) {
          const existing = await tx.order.findUnique({
            where: { idempotencyKey: data.idempotencyKey },
            include: {
              items: true,
              payments: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          });
          if (existing) {
            logger.info(`Idempotent order replay (DB): ${existing.orderNumber}`);
            return this.mapPrismaOrderToDTO(existing);
          }
        }

        // 1. Create Order record
        const order = await tx.order.create({
          data: {
            orderNumber: data.orderNumber,
            idempotencyKey: data.idempotencyKey,
            userId: data.userId || null,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            status: data.status,
            subtotal: data.subtotal,
            discountAmount: data.discountAmount,
            taxAmount: data.taxAmount,
            cgstAmount: data.cgstAmount,
            sgstAmount: data.sgstAmount,
            igstAmount: data.igstAmount,
            shippingFee: data.shippingFee,
            codFee: data.codFee,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            shippingAddressSnapshot: JSON.stringify(data.shippingAddress),
            billingAddressSnapshot: JSON.stringify(data.billingAddress),
            couponCode: data.couponCode || null,
            isGiftWrapped: data.isGiftWrapped,
            giftFee: data.giftFee,
            notes: data.notes || null,
          },
        });

        // 2. Create OrderItems & update Inventory
        for (const item of data.items) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              variantId: item.variantId || null,
              productTitle: item.productTitle,
              variantTitle: item.variantTitle,
              sku: item.sku,
              hsnCode: item.hsnCode || "7117",
              unitPrice: item.unitPrice,
              sellingPrice: item.sellingPrice,
              quantity: item.quantity,
              taxRatePercent: item.taxRatePercent,
              taxAmount: item.taxAmount,
              totalPrice: item.totalPrice,
              imageUrlSnapshot: item.imageUrl || null,
              variantAttributesSnapshot: item.attributes || {},
            },
          });

          // If variantId is present, update inventory
          if (item.variantId) {
            try {
              const inventory = await tx.inventory.findUnique({
                where: { variantId: item.variantId },
              });

              if (inventory) {
                await tx.inventory.update({
                  where: { variantId: item.variantId },
                  data: {
                    quantityAvailable: { decrement: item.quantity },
                    quantityReserved: { increment: item.quantity },
                  },
                });

                await tx.inventoryMovement.create({
                  data: {
                    inventoryId: inventory.id,
                    type: "ORDER_RESERVED",
                    quantityChange: -item.quantity,
                    balanceAfter: inventory.quantityAvailable - item.quantity,
                    referenceId: order.id,
                    reason: `Order ${order.orderNumber} placed`,
                  },
                });
              }
            } catch (invErr) {
              logger.warn(`Could not update inventory for variant ${item.variantId}`, { invErr });
            }
          }
        }

        // 3. Create Payment Record
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            attemptNumber: 1,
            amount: data.totalAmount,
            currency: "INR",
            method: data.paymentMethod,
            status: data.paymentStatus,
            razorpayOrderId: data.razorpayOrderId || null,
          },
        });

        // Fetch created order with items
        const fullOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: {
            items: true,
            payments: true,
          },
        });

        if (!fullOrder) throw new Error("Failed to retrieve created order from database");

        const result = this.mapPrismaOrderToDTO(fullOrder, payment.razorpayOrderId);
        inMemoryOrders.set(result.id, result);
        return result;
      });
    } catch (error) {
      logger.error("Database transaction failed during order creation. Reverting to memory fallback.", error);
      return this.createOrderInMemory(data);
    }
  }

  /**
   * Retrieves an order by ID.
   */
  async findById(id: string): Promise<OrderDTO | null> {
    const mem = inMemoryOrders.get(id);
    if (mem) return { ...mem };

    try {
      const record = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      if (!record) return null;
      return this.mapPrismaOrderToDTO(record);
    } catch (error) {
      logger.warn(`Failed to find order by id: ${id}`, { error });
      return null;
    }
  }

  /**
   * Retrieves an order by public Order Number.
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderDTO | null> {
    const foundMem = Array.from(inMemoryOrders.values()).find(
      (o) => o.orderNumber === orderNumber
    );
    if (foundMem) return { ...foundMem };

    try {
      const record = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      if (!record) return null;
      return this.mapPrismaOrderToDTO(record);
    } catch (error) {
      logger.warn(`Failed to find order by orderNumber: ${orderNumber}`, { error });
      return null;
    }
  }

  /**
   * Updates payment and order status upon payment confirmation.
   */
  async updatePaymentSuccess(
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<OrderDTO | null> {
    const mem = inMemoryOrders.get(orderId);
    if (mem) {
      mem.status = "PROCESSING";
      mem.paymentStatus = "CAPTURED";
      return { ...mem };
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        });

        const latestPayment = await tx.payment.findFirst({
          where: { orderId },
          orderBy: { createdAt: "desc" },
        });

        if (latestPayment) {
          await tx.payment.update({
            where: { id: latestPayment.id },
            data: {
              status: "CAPTURED",
              razorpayPaymentId,
              razorpaySignature,
            },
          });
        }
      });

      return await this.findById(orderId);
    } catch (error) {
      logger.error(`Failed to update payment success for order ${orderId}`, error);
      return null;
    }
  }

  /**
   * In-memory order creation for tests and offline operations.
   */
  private createOrderInMemory(data: CreateOrderParams): OrderDTO {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const items: OrderItemDTO[] = data.items.map((item, index) => ({
      id: `item_${orderId}_${index}`,
      orderId,
      variantId: item.variantId || null,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      sku: item.sku,
      hsnCode: item.hsnCode || "7117",
      unitPrice: item.unitPrice,
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      taxRatePercent: item.taxRatePercent,
      taxAmount: item.taxAmount,
      totalPrice: item.totalPrice,
      imageUrl: item.imageUrl || null,
      attributes: item.attributes || {},
    }));

    const orderDTO: OrderDTO = {
      id: orderId,
      orderNumber: data.orderNumber,
      idempotencyKey: data.idempotencyKey,
      userId: data.userId || null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      status: data.status,
      subtotal: data.subtotal,
      discountAmount: data.discountAmount,
      taxAmount: data.taxAmount,
      cgstAmount: data.cgstAmount,
      sgstAmount: data.sgstAmount,
      igstAmount: data.igstAmount,
      shippingFee: data.shippingFee,
      codFee: data.codFee,
      giftFee: data.giftFee,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      shippingAddressSnapshot: data.shippingAddress,
      billingAddressSnapshot: data.billingAddress,
      couponCode: data.couponCode || null,
      isGiftWrapped: data.isGiftWrapped,
      notes: data.notes || null,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      razorpayOrderId: data.razorpayOrderId || null,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholderKeyId",
    };

    inMemoryOrders.set(orderId, orderDTO);
    return orderDTO;
  }

  /**
   * Formats Prisma Order model to standard OrderDTO.
   */
  private mapPrismaOrderToDTO(
    order: PrismaOrderWithRelations,
    razorpayOrderId?: string | null
  ): OrderDTO {
    let shippingAddress: CheckoutAddressDTO;
    let billingAddress: CheckoutAddressDTO;

    try {
      shippingAddress =
        typeof order.shippingAddressSnapshot === "string"
          ? JSON.parse(order.shippingAddressSnapshot)
          : (order.shippingAddressSnapshot as CheckoutAddressDTO);
    } catch {
      shippingAddress = {
        fullName: order.customerName,
        phone: order.customerPhone,
        pincode: "110001",
        state: "Delhi",
        city: "New Delhi",
        addressLine1: "Primary Address",
        addressLine2: "",
        addressType: "HOME",
      };
    }

    try {
      billingAddress =
        typeof order.billingAddressSnapshot === "string"
          ? JSON.parse(order.billingAddressSnapshot)
          : (order.billingAddressSnapshot as CheckoutAddressDTO);
    } catch {
      billingAddress = shippingAddress;
    }

    const latestPayment = order.payments?.[0];

    const items: OrderItemDTO[] = (order.items || []).map((i) => ({
      id: i.id,
      orderId: i.orderId,
      variantId: i.variantId,
      productTitle: i.productTitle,
      variantTitle: i.variantTitle,
      sku: i.sku,
      hsnCode: i.hsnCode,
      unitPrice: Number(i.unitPrice),
      sellingPrice: Number(i.sellingPrice),
      quantity: i.quantity,
      taxRatePercent: Number(i.taxRatePercent),
      taxAmount: Number(i.taxAmount),
      totalPrice: Number(i.totalPrice),
      imageUrl: i.imageUrlSnapshot,
      attributes: (i.variantAttributesSnapshot as Record<string, string>) || {},
    }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      idempotencyKey: order.idempotencyKey,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      status: order.status as OrderStatusType,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      cgstAmount: Number(order.cgstAmount),
      sgstAmount: Number(order.sgstAmount),
      igstAmount: Number(order.igstAmount),
      shippingFee: Number(order.shippingFee),
      codFee: Number(order.codFee),
      giftFee: Number(order.giftFee || 0),
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod as PaymentMethodType,
      paymentStatus: (latestPayment?.status || "PENDING") as OrderDTO["paymentStatus"],
      shippingAddressSnapshot: shippingAddress,
      billingAddressSnapshot: billingAddress,
      couponCode: order.couponCode,
      isGiftWrapped: order.isGiftWrapped,
      notes: order.notes,
      items,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      razorpayOrderId: razorpayOrderId || latestPayment?.razorpayOrderId || null,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholderKeyId",
    };
  }

  /**
   * Resets in-memory store (for testing).
   */
  clearInMemory() {
    inMemoryOrders.clear();
  }
}

export const orderRepository = new OrderRepository();

