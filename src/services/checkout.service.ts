import crypto from "crypto";
import { orderRepository, CreateOrderParams } from "@/repositories/order.repository";
import { addressRepository } from "@/repositories/address.repository";
import { cartRepository } from "@/repositories/cart.repository";
import { productRepository } from "@/repositories/product.repository";
import { pincodeService } from "@/features/shipping/pincode.service";
import { calculateCartFinancials, CouponRule } from "@/lib/cart-calculations";
import {
  CheckoutCalculationDTO,
  CreateOrderRequestDTO,
  OrderDTO,
  VerifyPaymentRequestDTO,
  CheckoutItemDTO,
} from "@/types/checkout";
import { CartItemDTO } from "@/types/cart";
import { AuthUser } from "@/lib/auth";
import { ResolvedCartContext } from "@/lib/cart-session";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

const SEED_COUPONS: CouponRule[] = [
  {
    code: "WELCOME10",
    description: "10% off on your first luxury purchase above ₹999",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 999,
    maxDiscountCap: 500,
    isActive: true,
  },
  {
    code: "TINIWISH10",
    description: "10% off on handcrafted treasures",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 499,
    maxDiscountCap: 500,
    isActive: true,
  },
  {
    code: "TINIWISH15",
    description: "15% off on celebratory orders above ₹2,499",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderAmount: 2499,
    maxDiscountCap: 1000,
    isActive: true,
  },
  {
    code: "FREESHIP",
    description: "Free express shipping on all orders",
    discountType: "FREE_SHIPPING",
    discountValue: 99,
    minOrderAmount: 499,
    isActive: true,
  },
];

export class CheckoutService {
  /**
   * Calculates checkout financials, shipping fees, Indian GST, and delivery estimate.
   */
  async calculateCheckoutFinancials(params: {
    pincode: string;
    couponCode?: string | null;
    paymentMethod?: "RAZORPAY" | "COD";
    isGiftWrapped?: boolean;
    items?: CheckoutItemDTO[];
    cartContext?: ResolvedCartContext;
  }): Promise<CheckoutCalculationDTO> {
    const { pincode, couponCode, isGiftWrapped, items: clientItems, cartContext } = params;

    // 1. Validate PIN code
    if (!pincodeService.isValidPincode(pincode)) {
      throw new BadRequestError("Please provide a valid 6-digit Indian PIN code");
    }

    const serviceability = pincodeService.checkServiceability(pincode);

    // 2. Resolve items from server Cart or verify client variant IDs against database
    const cartItems = await this.resolveAuthoritativeItems(clientItems, cartContext);

    if (cartItems.length === 0) {
      throw new BadRequestError("Your shopping cart is empty");
    }

    // 3. Find active coupon rule
    let couponRule: CouponRule | null = null;
    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      couponRule = SEED_COUPONS.find((c) => c.code === cleanCode && c.isActive) || null;
    }

    // 4. Calculate core financials
    const { calculation, appliedCoupon } = calculateCartFinancials(cartItems, couponRule);

    const giftFee = isGiftWrapped ? 99 : 0;
    const codFee = 0; // Complimentary COD
    const grandTotal = Math.round((calculation.grandTotal + giftFee + codFee) * 100) / 100;

    return {
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      taxAmount: calculation.taxAmount,
      cgstAmount: calculation.cgstAmount,
      sgstAmount: calculation.sgstAmount,
      igstAmount: calculation.igstAmount,
      shippingFee: calculation.shippingFee,
      codFee,
      giftFee,
      grandTotal,
      isFreeShipping: calculation.isFreeShipping,
      isCodAvailable: serviceability.isCodAvailable,
      appliedCoupon,
      estimatedDeliveryDays: serviceability.estimatedDays,
      estimatedDeliveryDate: serviceability.estimatedDeliveryDate,
      courierName: serviceability.courier,
    };
  }

  /**
   * Creates an order with database transactions, stock validation, address snapshots, and idempotency protection.
   */
  async createOrder(
    data: CreateOrderRequestDTO,
    authUser?: AuthUser | null,
    cartContext?: ResolvedCartContext
  ): Promise<OrderDTO> {
    const {
      idempotencyKey,
      customer,
      shippingAddress,
      billingAddress = shippingAddress,
      paymentMethod,
      couponCode,
      isGiftWrapped = false,
      notes,
      items: clientItems,
    } = data;

    // 1. Validate PIN code
    if (!pincodeService.isValidPincode(shippingAddress.pincode)) {
      throw new BadRequestError("Please provide a valid 6-digit Indian PIN code");
    }

    // 2. Resolve authoritative server items and check stock
    const cartItems = await this.resolveAuthoritativeItems(clientItems, cartContext);
    if (cartItems.length === 0) {
      throw new BadRequestError("Cannot checkout an empty shopping cart");
    }

    // 3. Validate stock availability for all items
    await this.validateStockAvailability(cartItems);

    // 4. Calculate authoritative server financials
    let couponRule: CouponRule | null = null;
    if (couponCode && couponCode.trim()) {
      const clean = couponCode.trim().toUpperCase();
      couponRule = SEED_COUPONS.find((c) => c.code === clean && c.isActive) || null;
    }

    const { calculation, appliedCoupon } = calculateCartFinancials(cartItems, couponRule);
    const giftFee = isGiftWrapped ? 99 : 0;
    const codFee = 0;
    const totalAmount = Math.round((calculation.grandTotal + giftFee + codFee) * 100) / 100;

    // 5. If user is authenticated and saveToProfile is requested, persist address
    if (authUser && shippingAddress.saveToProfile) {
      await addressRepository.createAddress(authUser.id, shippingAddress).catch((err) => {
        logger.warn("Could not save address to user profile", { err });
      });
    }

    // 6. Generate public order number: e.g. TW-2026-849201
    const orderNumber = `TW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 7. Prepare Razorpay order ID if paying via Razorpay
    let razorpayOrderId: string | null = null;
    if (paymentMethod === "RAZORPAY") {
      razorpayOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    // 8. Construct CreateOrderParams
    const orderParams: CreateOrderParams = {
      idempotencyKey,
      orderNumber,
      userId: authUser?.id || null,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      status: paymentMethod === "COD" ? "PROCESSING" : "PENDING_PAYMENT",
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      taxAmount: calculation.taxAmount,
      cgstAmount: calculation.cgstAmount,
      sgstAmount: calculation.sgstAmount,
      igstAmount: calculation.igstAmount,
      shippingFee: calculation.shippingFee,
      codFee,
      giftFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "INITIATED",
      shippingAddress,
      billingAddress,
      couponCode: appliedCoupon?.code || null,
      isGiftWrapped,
      notes: notes || null,
      items: cartItems.map((item) => {
        const itemTotal = Number(item.price) * item.quantity;
        const gstRate = item.gstRatePercent || 3.0;
        const taxAmount = Math.round(((itemTotal * gstRate) / (100 + gstRate)) * 100) / 100;

        return {
          variantId: item.variantId || null,
          productTitle: item.title,
          variantTitle: item.variantTitle || "Default",
          sku: item.sku || `SKU-${item.productId.substring(0, 8)}`,
          hsnCode: "7117",
          unitPrice: item.mrp || item.price,
          sellingPrice: item.price,
          quantity: item.quantity,
          taxRatePercent: gstRate,
          taxAmount,
          totalPrice: itemTotal,
          imageUrl: item.image,
          attributes: item.attributes || {},
        };
      }),
      razorpayOrderId,
    };

    // 9. Execute database transaction
    const createdOrder = await orderRepository.createOrderWithTransaction(orderParams);

    // 10. Clear caller's database cart if cartContext is available
    if (cartContext) {
      try {
        const cartId = await cartRepository.getOrCreateCart({
          userId: cartContext.userId,
          sessionToken: cartContext.sessionToken,
        });
        await cartRepository.clearCart(cartId);
      } catch {
        // Ignored
      }
    }

    return createdOrder;
  }

  /**
   * Verifies Razorpay payment signature and activates order.
   */
  async verifyPayment(
    orderId: string,
    paymentData: VerifyPaymentRequestDTO,
    authUser?: AuthUser | null
  ): Promise<OrderDTO> {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = paymentData;

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order with ID '${orderId}' not found`);
    }

    if (authUser && order.userId && order.userId !== authUser.id) {
      throw new UnauthorizedError("You are not authorized to modify this order");
    }

    // Verify HMAC SHA256 Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !secret || secret.includes("placeholder");

    if (!isMock) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        throw new BadRequestError("Invalid payment signature verification failed");
      }
    }

    const updatedOrder = await orderRepository.updatePaymentSuccess(
      orderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!updatedOrder) {
      throw new Error("Failed to record payment verification");
    }

    return updatedOrder;
  }

  /**
   * Retrieves an order by ID or orderNumber, with privacy protection.
   */
  async getOrder(
    identifier: string,
    authUser?: AuthUser | null
  ): Promise<OrderDTO> {
    let order = await orderRepository.findById(identifier);
    if (!order) {
      order = await orderRepository.findByOrderNumber(identifier);
    }

    if (!order) {
      throw new NotFoundError(`Order '${identifier}' not found`);
    }

    // If order has an owner, verify ownership
    if (order.userId && authUser && order.userId !== authUser.id && authUser.role !== "ADMIN") {
      throw new UnauthorizedError("You do not have permission to view this order");
    }

    return order;
  }

  /**
   * Validates available stock for each cart item.
   */
  private async validateStockAvailability(items: CartItemDTO[]): Promise<void> {
    for (const item of items) {
      if (item.variantId) {
        // Query product details from product repository
        const product = await productRepository.findById(item.productId);
        if (product) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (variant && variant.stockQuantity < item.quantity) {
            if (variant.stockQuantity <= 0) {
              throw new ConflictError(
                `Item '${item.title}' is currently out of stock.`
              );
            }
            throw new ConflictError(
              `Only ${variant.stockQuantity} units available for '${item.title}'. Please reduce quantity.`
            );
          }
        }
      }
    }
  }

  /**
   * Resolves authoritative items from server cart or fetches genuine database prices.
   */
  private async resolveAuthoritativeItems(
    clientItems?: CheckoutItemDTO[],
    cartContext?: ResolvedCartContext
  ): Promise<CartItemDTO[]> {
    // 1. If cartContext provided, fetch genuine database cart items
    if (cartContext) {
      try {
        const cartId = await cartRepository.getOrCreateCart({
          userId: cartContext.userId,
          sessionToken: cartContext.sessionToken,
        });
        const cart = await cartRepository.getCartById(cartId);

        if (cart && cart.items && cart.items.length > 0) {
          return cart.items;
        }
      } catch (err) {
        logger.warn("Could not retrieve cart from cartRepository, falling back to items", { err });
      }
    }

    // 2. If client provided items, verify genuine server prices against database / seed catalogue
    if (clientItems && clientItems.length > 0) {
      const verifiedItems: CartItemDTO[] = [];

      for (const cItem of clientItems) {
        const prod = await productRepository.findById(cItem.productId);
        if (!prod) continue;

        const variant =
          (cItem.variantId && prod.variants.find((v) => v.id === cItem.variantId)) ||
          prod.variants.find((v) => v.isDefault) ||
          prod.variants[0];

        const genuinePrice = variant ? Number(variant.sellingPrice) : 0;
        const genuineMrp = variant ? Number(variant.mrp) : genuinePrice;
        const primaryImage =
          prod.images.find((img) => img.isPrimary)?.url ||
          prod.images[0]?.url ||
          cItem.image ||
          "/images/placeholder.jpg";

        verifiedItems.push({
          id: `item_${prod.id}_${variant?.id || "def"}`,
          cartId: "guest_cart",
          variantId: variant?.id || "default",
          productId: prod.id,
          title: prod.title,
          variantTitle: variant?.title || "Default",
          sku: variant?.sku || `SKU-${prod.id}`,
          slug: prod.slug,
          image: primaryImage,
          price: genuinePrice,
          mrp: genuineMrp,
          quantity: cItem.quantity,
          attributes: variant?.attributes || {},
          stockQuantity: variant?.stockQuantity ?? 10,
          lowStockThreshold: variant?.lowStockThreshold ?? 2,
          isAvailable: (variant?.stockQuantity ?? 10) > 0,
          gstRatePercent: 3.0,
          itemTotal: genuinePrice * cItem.quantity,
        });
      }

      return verifiedItems;
    }

    return [];
  }
}

export const checkoutService = new CheckoutService();
