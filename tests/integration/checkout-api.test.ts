import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as calculateFinancials } from "@/app/api/v1/checkout/calculate/route";
import { POST as placeOrder } from "@/app/api/v1/checkout/orders/route";
import { GET as getOrder } from "@/app/api/v1/checkout/orders/[id]/route";
import { POST as verifyPayment } from "@/app/api/v1/checkout/orders/[id]/verify-payment/route";
import { orderRepository } from "@/repositories/order.repository";

describe("Checkout API v1 Integration Tests", () => {
  beforeEach(() => {
    orderRepository.clearInMemory();
  });

  const validAddress = {
    fullName: "Sunita Kapoor",
    phone: "9876543210",
    pincode: "110001",
    state: "Delhi",
    city: "New Delhi",
    addressLine1: "Villa 5, Anand Lok",
    addressLine2: "August Kranti Marg",
    landmark: "Near Siri Fort",
    addressType: "HOME",
  };

  const sampleItems = [
    {
      productId: "prod_kundan_choker",
      quantity: 1,
    },
  ];

  it("POST /api/v1/checkout/calculate calculates authoritative server totals", async () => {
    const request = new NextRequest("http://localhost/api/v1/checkout/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: "110001",
        couponCode: "WELCOME10",
        paymentMethod: "RAZORPAY",
        items: sampleItems,
      }),
    });

    const response = await calculateFinancials(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.subtotal).toBeGreaterThan(0);
    expect(json.data.taxAmount).toBeGreaterThan(0);
    expect(json.data.appliedCoupon?.code).toBe("WELCOME10");
    expect(json.data.estimatedDeliveryDate).toBeDefined();
  });

  it("POST /api/v1/checkout/orders creates guest order with COD", async () => {
    const request = new NextRequest("http://localhost/api/v1/checkout/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idempotencyKey: "guest_api_order_key_001",
        customer: {
          name: "Sunita Kapoor",
          email: "sunita@example.com",
          phone: "9876543210",
        },
        shippingAddress: validAddress,
        paymentMethod: "COD",
        items: sampleItems,
      }),
    });

    const response = await placeOrder(request);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.orderNumber).toMatch(/^TW-\d{4}-\d{6}$/);
    expect(json.data.status).toBe("PROCESSING");
    expect(json.data.items.length).toBe(1);
    expect(json.data.shippingAddressSnapshot.fullName).toBe("Sunita Kapoor");
  });

  it("POST /api/v1/checkout/orders prevents duplicate orders on repeated requests with same idempotencyKey", async () => {
    const payload = {
      idempotencyKey: "unique_idemp_token_repeat_123",
      customer: {
        name: "Sunita Kapoor",
        email: "sunita@example.com",
        phone: "9876543210",
      },
      shippingAddress: validAddress,
      paymentMethod: "COD",
      items: sampleItems,
    };

    const req1 = new NextRequest("http://localhost/api/v1/checkout/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res1 = await placeOrder(req1);
    const json1 = await res1.json();

    const req2 = new NextRequest("http://localhost/api/v1/checkout/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res2 = await placeOrder(req2);
    const json2 = await res2.json();

    // Must return the exact same order without duplication
    expect(json2.data.id).toBe(json1.data.id);
    expect(json2.data.orderNumber).toBe(json1.data.orderNumber);
  });

  it("POST /api/v1/checkout/orders supports authenticated checkout", async () => {
    const request = new NextRequest("http://localhost/api/v1/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mock-user-id": "user_auth_123",
        "x-mock-user-email": "auth_buyer@tiniwish.com",
        "x-mock-user-role": "CUSTOMER",
      },
      body: JSON.stringify({
        idempotencyKey: "auth_api_order_key_002",
        customer: {
          name: "Auth Buyer",
          email: "auth_buyer@tiniwish.com",
          phone: "9876543210",
        },
        shippingAddress: {
          ...validAddress,
          saveToProfile: true,
        },
        paymentMethod: "RAZORPAY",
        items: sampleItems,
      }),
    });

    const response = await placeOrder(request);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.data.userId).toBe("user_auth_123");
    expect(json.data.status).toBe("PENDING_PAYMENT");
    expect(json.data.razorpayOrderId).toBeDefined();
  });

  it("GET /api/v1/checkout/orders/[id] and verify-payment confirms purchase", async () => {
    // 1. Place Razorpay order
    const placeReq = new NextRequest("http://localhost/api/v1/checkout/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idempotencyKey: "verify_pay_order_key_003",
        customer: {
          name: "Sunita Kapoor",
          email: "sunita@example.com",
          phone: "9876543210",
        },
        shippingAddress: validAddress,
        paymentMethod: "RAZORPAY",
        items: sampleItems,
      }),
    });

    const placeRes = await placeOrder(placeReq);
    const orderData = (await placeRes.json()).data;

    // 2. Fetch order by orderNumber
    const getReq = new NextRequest(`http://localhost/api/v1/checkout/orders/${orderData.orderNumber}`);
    const getRes = await getOrder(getReq, {
      params: Promise.resolve({ id: orderData.orderNumber }),
    });

    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.id).toBe(orderData.id);

    // 3. Verify payment
    const verifyReq = new NextRequest(
      `http://localhost/api/v1/checkout/orders/${orderData.id}/verify-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayPaymentId: "pay_rzp_mock_123",
          razorpayOrderId: orderData.razorpayOrderId,
          razorpaySignature: "mock_signature_valid",
        }),
      }
    );

    const verifyRes = await verifyPayment(verifyReq, {
      params: Promise.resolve({ id: orderData.id }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.data.status).toBe("PROCESSING");
    expect(verifyJson.data.paymentStatus).toBe("CAPTURED");
  });
});

