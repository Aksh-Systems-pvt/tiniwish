// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  UPIPay,
  rupeesToPaise,
  generateUPIQR,
  buildUPIUri,
  PhonePeAdapter,
  PaytmAdapter,
  InvalidConfigError,
} from "akshpay";

describe("AkshPay Local Package Integration", () => {
  it("imports UPIPay and public exports from 'akshpay'", () => {
    expect(UPIPay).toBeDefined();
    expect(rupeesToPaise).toBeDefined();
    expect(generateUPIQR).toBeDefined();
    expect(buildUPIUri).toBeDefined();
    expect(PhonePeAdapter).toBeDefined();
    expect(PaytmAdapter).toBeDefined();
    expect(InvalidConfigError).toBeDefined();
  });

  it("calculates rupeesToPaise accurately avoiding floating point errors", () => {
    // 5.99 * 100 in naive JS is 599.0000000000001
    expect(rupeesToPaise(5.99)).toBe(599);
    expect(rupeesToPaise(499.5)).toBe(49950);
    expect(rupeesToPaise(1200)).toBe(120000);
  });

  it("constructs UPIPay client with sandbox PhonePe configuration", () => {
    const client = new UPIPay({
      provider: "phonepe",
      environment: "sandbox",
      credentials: {
        merchantId: "MERCHANTUAT",
        saltKey: "ab1c2d3e-f4g5-6789-abcd-ef1234567890",
        saltIndex: "1",
      },
    });

    expect(client.provider).toBe("phonepe");
    expect(client.environment).toBe("sandbox");
    expect(client.getAdapter()).toBeInstanceOf(PhonePeAdapter);
  });

  it("constructs UPIPay client with sandbox Paytm configuration", () => {
    const client = new UPIPay({
      provider: "paytm",
      environment: "sandbox",
      credentials: {
        merchantId: "PAYTM_MID_12345",
        merchantKey: "ab1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q",
      },
    });

    expect(client.provider).toBe("paytm");
    expect(client.getAdapter()).toBeInstanceOf(PaytmAdapter);
  });

  it("generates an NPCI-compliant UPI QR data URL and URI", async () => {
    const result = await generateUPIQR({
      vpa: "tiniwish@ybl",
      name: "TiniWish Luxury Store",
      amount: 1499,
      orderId: "TW-ORDER-TEST-001",
      note: "Order payment TW-ORDER-TEST-001",
    });

    expect(result.upiUri).toContain("upi://pay?");
    expect(result.upiUri).toContain("pa=tiniwish%40ybl");
    expect(result.upiUri).toContain("am=1499.00");
    expect(result.upiUri).toContain("tr=TW-ORDER-TEST-001");
    expect(result.qrImage).toMatch(/^data:image\/png;base64,/);
  });
});
