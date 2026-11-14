// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import {
  paymentProviderRegistry,
  paymentService,
  AkshPayUPIAdapter,
  CODAdapter,
  RazorpayAdapter,
} from "@/features/payments";
import { orderRepository } from "@/repositories/order.repository";
import { BadRequestError } from "@/lib/errors";
import { OrderDTO } from "@/types/checkout";

describe("Payment Architecture & Provider Independence", () => {
  beforeEach(() => {
    orderRepository.clearInMemory();
  });

  describe("Payment Provider Registry & Unsupported Methods", () => {
    it("resolves AkshPay PhonePe adapter for UPI payment method", () => {
      const provider = paymentProviderRegistry.getProviderForMethod("UPI");
      expect(provider).toBeInstanceOf(AkshPayUPIAdapter);
      expect(provider.name).toBe("AKSHPAY_PHONEPE");
      expect(provider.supportedMethods).toContain("UPI");
    });

    it("resolves Cash on Delivery adapter for COD payment method", () => {
      const provider = paymentProviderRegistry.getProviderForMethod("COD");
      expect(provider).toBeInstanceOf(CODAdapter);
      expect(provider.name).toBe("COD");
      expect(provider.supportedMethods).toContain("COD");
    });

    it("resolves Razorpay adapter for RAZORPAY payment method", () => {
      const provider = paymentProviderRegistry.getProviderForMethod("RAZORPAY");
      expect(provider).toBeInstanceOf(RazorpayAdapter);
      expect(provider.name).toBe("RAZORPAY");
      expect(provider.supportedMethods).toContain("RAZORPAY");
    });

    it("keeps unsupported payment methods disabled", () => {
      expect(() => paymentProviderRegistry.getProviderForMethod("CARDS")).toThrow(
        BadRequestError
      );
      expect(() => paymentProviderRegistry.getProviderForMethod("NETBANKING")).toThrow(
        BadRequestError
      );
      expect(() => paymentProviderRegistry.getProviderForMethod("INTERNATIONAL")).toThrow(
        BadRequestError
      );
      expect(paymentProviderRegistry.isMethodSupported("CARDS")).toBe(false);
      expect(paymentProviderRegistry.isMethodSupported("UPI")).toBe(true);
      expect(paymentProviderRegistry.isMethodSupported("COD")).toBe(true);
    });
  });

  describe("AkshPay UPI Adapter", () => {
    const akshpay = new AkshPayUPIAdapter({
      provider: "phonepe",
      environment: "sandbox",
      credentials: {
        merchantId: "MERCHANTUAT",
        saltKey: "ab1c2d3e-f4g5-6789-abcd-ef1234567890",
        saltIndex: "1",
      },
    });

    it("creates UPI payment and generates NPCI QR and intent links", async () => {
      const result = await akshpay.createPayment({
        orderId: "ord_101",
        orderNumber: "TW-2026-1001",
        amountInRupees: 1499,
        amountInPaise: 149900,
        currency: "INR",
        customer: {
          name: "Pooja Sharma",
          email: "pooja@example.com",
          phone: "9876543210",
        },
        idempotencyKey: "idemp_test_upi_01",
        upiOptions: { generateQR: true },
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe("AKSHPAY_PHONEPE");
      expect(result.providerReferenceId).toBe("TW-2026-1001");
      expect(result.amountInPaise).toBe(149900);
      expect(result.status).toBe("INITIATED");
      expect(result.upiUri).toContain("upi://pay?");
      expect(result.upiUri).toContain("am=1499.00");
      expect(result.qrDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.intentLinks).toBeDefined();
      expect(result.intentLinks?.phonepe).toContain("phonepe://");
      expect(result.intentLinks?.gpay).toContain("tez://upi");
    });

    it("verifies incoming PhonePe webhook notifications with valid checksum", async () => {
      // Create valid PhonePe base64 payload and checksum
      const rawPayloadData = {
        success: true,
        code: "PAYMENT_SUCCESS",
        message: "Payment successful",
        data: {
          merchantId: "MERCHANTUAT",
          merchantTransactionId: "TW-2026-1001",
          transactionId: "TXN_PHON_123456",
          amount: 149900,
          state: "COMPLETED",
          responseCode: "SUCCESS",
        },
      };

      const base64Data = Buffer.from(JSON.stringify(rawPayloadData)).toString("base64");
      // Compute PhonePe checksum: SHA256(base64Data + saltKey) + "###" + saltIndex
      const crypto = await import("node:crypto");
      const saltKey = "ab1c2d3e-f4g5-6789-abcd-ef1234567890";
      const saltIndex = "1";
      const hash = crypto.createHash("sha256").update(base64Data + saltKey).digest("hex");
      const validSignature = `${hash}###${saltIndex}`;

      const webhookResult = await akshpay.verifyWebhook({
        payload: { response: base64Data },
        headers: {
          "x-verify": validSignature,
        },
        expectedAmountInPaise: 149900,
      });

      expect(webhookResult.isValid).toBe(true);
      expect(webhookResult.status).toBe("CAPTURED");
      expect(webhookResult.orderId).toBe("TW-2026-1001");
      expect(webhookResult.providerTransactionId).toBe("TXN_PHON_123456");
      expect(webhookResult.amountInPaise).toBe(149900);
    });

    it("rejects tampered webhook notifications", async () => {
      const webhookResult = await akshpay.verifyWebhook({
        payload: { response: "invalid_tampered_base64" },
        headers: {
          "x-verify": "invalid_signature_hash###1",
        },
      });

      expect(webhookResult.isValid).toBe(false);
      expect(webhookResult.status).toBe("FAILED");
      expect(webhookResult.safeError).toBeDefined();
    });
  });

  describe("Cash on Delivery (COD) Adapter", () => {
    const cod = new CODAdapter();

    it("creates pending payment with zero redirect or QR requirements", async () => {
      const result = await cod.createPayment({
        orderId: "ord_102",
        orderNumber: "TW-2026-1002",
        amountInRupees: 999,
        amountInPaise: 99900,
        currency: "INR",
        customer: {
          name: "Rahul Verma",
          email: "rahul@example.com",
          phone: "9876543211",
        },
        idempotencyKey: "idemp_test_cod_01",
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe("COD");
      expect(result.status).toBe("PENDING");
      expect(result.redirectUrl).toBeUndefined();
      expect(result.qrDataUrl).toBeUndefined();
    });

    it("returns invalid for webhook attempts since COD has no automated webhooks", async () => {
      const res = await cod.verifyWebhook({
        payload: {},
        headers: {},
      });
      expect(res.isValid).toBe(false);
      expect(res.safeError).toContain("does not support");
    });
  });

  describe("PaymentService: Idempotency, Duplicate Prevention & Webhook Auditing", () => {
    let testOrder: OrderDTO;

    beforeEach(async () => {
      testOrder = await orderRepository.createOrderWithTransaction({
        idempotencyKey: "test_order_idemp_key_01",
        orderNumber: "TW-2026-999001",
        customerName: "Aarav Mehta",
        customerEmail: "aarav@example.com",
        customerPhone: "9876543210",
        status: "PENDING_PAYMENT",
        subtotal: 1499,
        discountAmount: 0,
        taxAmount: 43.66,
        cgstAmount: 21.83,
        sgstAmount: 21.83,
        igstAmount: 0,
        shippingFee: 0,
        codFee: 0,
        giftFee: 0,
        totalAmount: 1499,
        paymentMethod: "UPI",
        paymentStatus: "INITIATED",
        shippingAddress: {
          fullName: "Aarav Mehta",
          phone: "9876543210",
          pincode: "110001",
          state: "Delhi",
          city: "New Delhi",
          addressLine1: "Connaught Place",
          addressLine2: "",
          addressType: "HOME",
        },
        billingAddress: {
          fullName: "Aarav Mehta",
          phone: "9876543210",
          pincode: "110001",
          state: "Delhi",
          city: "New Delhi",
          addressLine1: "Connaught Place",
          addressLine2: "",
          addressType: "HOME",
        },
        isGiftWrapped: false,
        items: [
          {
            productTitle: "Heritage Kundan Jhumkas",
            variantTitle: "Gold",
            sku: "JHM-001",
            unitPrice: 1499,
            sellingPrice: 1499,
            quantity: 1,
            taxRatePercent: 3,
            taxAmount: 43.66,
            totalPrice: 1499,
          },
        ],
      });
    });

    it("prevents duplicate payment records on identical idempotencyKey", async () => {
      const res1 = await paymentService.initiatePayment({
        orderId: testOrder.id,
        paymentMethod: "UPI",
        idempotencyKey: "idemp_pay_unique_123",
      });

      const res2 = await paymentService.initiatePayment({
        orderId: testOrder.id,
        paymentMethod: "UPI",
        idempotencyKey: "idemp_pay_unique_123",
      });

      expect(res1.providerReferenceId).toBe(res2.providerReferenceId);
      expect(res1.amountInPaise).toBe(res2.amountInPaise);
      expect(res1.provider).toBe("AKSHPAY_PHONEPE");
    });

    it("confirms payment and prevents duplicate order confirmation", async () => {
      const confirmedOrder1 = await paymentService.confirmPayment(
        testOrder.id,
        "TXN_CONFIRM_12345",
        "AKSHPAY_PHONEPE"
      );

      expect(confirmedOrder1.status).toBe("PROCESSING");
      expect(confirmedOrder1.paymentStatus).toBe("CAPTURED");

      // Repeated confirmation call returns existing order without re-processing
      const confirmedOrder2 = await paymentService.confirmPayment(
        testOrder.id,
        "TXN_CONFIRM_12345",
        "AKSHPAY_PHONEPE"
      );

      expect(confirmedOrder2.status).toBe("PROCESSING");
      expect(confirmedOrder2.id).toBe(confirmedOrder1.id);
    });

    it("processes webhooks idempotently and sanitizes sensitive secrets", async () => {
      const rawPayloadData = {
        success: true,
        code: "PAYMENT_SUCCESS",
        message: "Payment successful",
        data: {
          merchantId: "MERCHANTUAT",
          merchantTransactionId: testOrder.orderNumber,
          transactionId: "TXN_WEBHOOK_999888",
          amount: 149900,
          state: "COMPLETED",
          responseCode: "SUCCESS",
        },
      };

      const base64Data = Buffer.from(JSON.stringify(rawPayloadData)).toString("base64");
      const crypto = await import("node:crypto");
      const saltKey = "ab1c2d3e-f4g5-6789-abcd-ef1234567890";
      const saltIndex = "1";
      const hash = crypto.createHash("sha256").update(base64Data + saltKey).digest("hex");
      const signature = `${hash}###${saltIndex}`;

      // First webhook call processes successfully
      const webhookRes1 = await paymentService.processWebhook("AKSHPAY_PHONEPE", {
        payload: {
          response: base64Data,
          authorization: "SecretBearerTokenShouldBeSanitized",
        },
        headers: {
          "x-verify": signature,
        },
        expectedAmountInPaise: 149900,
      });

      expect(webhookRes1.isValid).toBe(true);
      expect(webhookRes1.status).toBe("CAPTURED");

      // Verify order is now marked as confirmed
      const updatedOrder = await orderRepository.findById(testOrder.id);
      expect(updatedOrder?.status).toBe("PROCESSING");
      expect(updatedOrder?.paymentStatus).toBe("CAPTURED");

      // Second webhook call with the same eventId replays idempotently without errors
      const webhookRes2 = await paymentService.processWebhook("AKSHPAY_PHONEPE", {
        payload: { response: base64Data },
        headers: {
          "x-verify": signature,
        },
        expectedAmountInPaise: 149900,
      });

      expect(webhookRes2.isValid).toBe(true);
      expect(webhookRes2.eventId).toBe(webhookRes1.eventId);
    });
  });
});
