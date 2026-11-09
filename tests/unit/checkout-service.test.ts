import { describe, it, expect, beforeEach } from "vitest";
import { checkoutService } from "@/services/checkout.service";
import { orderRepository } from "@/repositories/order.repository";
import { CreateOrderRequestDTO } from "@/types/checkout";
import { BadRequestError } from "@/lib/errors";

describe("CheckoutService Unit Tests", () => {
  beforeEach(() => {
    orderRepository.clearInMemory();
  });

  const validAddress = {
    fullName: "Pooja Malhotra",
    phone: "9812345678",
    pincode: "110001",
    state: "Delhi",
    city: "New Delhi",
    addressLine1: "B-12, Barakhamba Road",
    addressLine2: "Connaught Place",
    landmark: "Near Metro",
    addressType: "HOME" as const,
  };

  const sampleItems = [
    {
      productId: "prod_kundan_choker",
      quantity: 1,
      title: "Noor Kundan Choker",
      sku: "SKU-KUNDAN",
      image: "/images/test.jpg",
      sellingPrice: 3499,
    },
  ];

  it("calculates checkout financials with free express shipping above ₹999", async () => {
    const result = await checkoutService.calculateCheckoutFinancials({
      pincode: "110001",
      items: sampleItems,
    });

    expect(result.subtotal).toBe(3299);
    expect(result.shippingFee).toBe(0);
    expect(result.isFreeShipping).toBe(true);
    expect(result.taxAmount).toBeGreaterThan(0);
    expect(result.grandTotal).toBe(3299);
    expect(result.isCodAvailable).toBe(true);
    expect(result.estimatedDeliveryDate).toBeDefined();
  });

  it("applies coupon code discount and updates financials accurately", async () => {
    const result = await checkoutService.calculateCheckoutFinancials({
      pincode: "110001",
      couponCode: "WELCOME10",
      items: sampleItems,
    });

    expect(result.appliedCoupon).not.toBeNull();
    expect(result.appliedCoupon?.code).toBe("WELCOME10");
    expect(result.discountAmount).toBe(330); // 10% of 3299 rounded
    expect(result.grandTotal).toBe(3299 - 330);
  });

  it("adds ₹99 gift packaging fee when requested", async () => {
    const result = await checkoutService.calculateCheckoutFinancials({
      pincode: "110001",
      isGiftWrapped: true,
      items: sampleItems,
    });

    expect(result.giftFee).toBe(99);
    expect(result.grandTotal).toBe(3299 + 99);
  });

  it("rejects invalid PIN code with BadRequestError", async () => {
    await expect(
      checkoutService.calculateCheckoutFinancials({
        pincode: "9999", // Invalid length
        items: sampleItems,
      })
    ).rejects.toThrow(BadRequestError);
  });

  it("creates a COD order with PROCESSING status and immutable snapshots", async () => {
    const orderReq: CreateOrderRequestDTO = {
      idempotencyKey: "test_idemp_key_cod_001",
      customer: {
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        phone: "9812345678",
      },
      shippingAddress: validAddress,
      paymentMethod: "COD",
      items: sampleItems,
    };

    const order = await checkoutService.createOrder(orderReq);

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^TW-\d{4}-\d{6}$/);
    expect(order.status).toBe("PROCESSING");
    expect(order.paymentMethod).toBe("COD");
    expect(order.totalAmount).toBe(3299);
    expect(order.items.length).toBe(1);
    expect(order.shippingAddressSnapshot.fullName).toBe("Pooja Malhotra");
    expect(order.shippingAddressSnapshot.pincode).toBe("110001");
  });

  it("creates a Razorpay order with PENDING_PAYMENT status and generates razorpayOrderId", async () => {
    const orderReq: CreateOrderRequestDTO = {
      idempotencyKey: "test_idemp_key_rzp_002",
      customer: {
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        phone: "9812345678",
      },
      shippingAddress: validAddress,
      paymentMethod: "RAZORPAY",
      items: sampleItems,
    };

    const order = await checkoutService.createOrder(orderReq);

    expect(order.status).toBe("PENDING_PAYMENT");
    expect(order.paymentMethod).toBe("RAZORPAY");
    expect(order.razorpayOrderId).toBeDefined();
    expect(order.razorpayKeyId).toBeDefined();
  });

  it("Idempotency: repeated order creation with identical idempotencyKey returns existing order without duplicates", async () => {
    const orderReq: CreateOrderRequestDTO = {
      idempotencyKey: "unique_client_token_repeat_test",
      customer: {
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        phone: "9812345678",
      },
      shippingAddress: validAddress,
      paymentMethod: "COD",
      items: sampleItems,
    };

    const firstOrder = await checkoutService.createOrder(orderReq);
    const secondOrder = await checkoutService.createOrder(orderReq);

    // Must be the identical order record
    expect(secondOrder.id).toBe(firstOrder.id);
    expect(secondOrder.orderNumber).toBe(firstOrder.orderNumber);
    expect(secondOrder.createdAt).toBe(firstOrder.createdAt);
  });

  it("verifies payment signature and updates order status to PROCESSING", async () => {
    const orderReq: CreateOrderRequestDTO = {
      idempotencyKey: "test_idemp_key_rzp_003",
      customer: {
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        phone: "9812345678",
      },
      shippingAddress: validAddress,
      paymentMethod: "RAZORPAY",
      items: sampleItems,
    };

    const order = await checkoutService.createOrder(orderReq);

    const verifiedOrder = await checkoutService.verifyPayment(order.id, {
      razorpayPaymentId: "pay_test_payment_123",
      razorpayOrderId: order.razorpayOrderId || "order_rzp_test",
      razorpaySignature: "mock_signature_valid",
    });

    expect(verifiedOrder.status).toBe("PROCESSING");
    expect(verifiedOrder.paymentStatus).toBe("CAPTURED");
  });

  it("retrieves an existing order by ID or orderNumber", async () => {
    const orderReq: CreateOrderRequestDTO = {
      idempotencyKey: "test_idemp_key_lookup_004",
      customer: {
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        phone: "9812345678",
      },
      shippingAddress: validAddress,
      paymentMethod: "COD",
      items: sampleItems,
    };

    const created = await checkoutService.createOrder(orderReq);

    const foundById = await checkoutService.getOrder(created.id);
    expect(foundById.orderNumber).toBe(created.orderNumber);

    const foundByNumber = await checkoutService.getOrder(created.orderNumber);
    expect(foundByNumber.id).toBe(created.id);
  });
});
