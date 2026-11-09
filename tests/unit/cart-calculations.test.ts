import { describe, it, expect } from "vitest";
import { calculateCartFinancials, CouponRule } from "@/lib/cart-calculations";
import { CartItemDTO } from "@/types/cart";

describe("Cart Financials & Calculations Unit Tests", () => {
  const mockItems: CartItemDTO[] = [
    {
      id: "item_1",
      cartId: "cart_1",
      variantId: "var_1",
      productId: "prod_1",
      title: "Royal Kundan Choker",
      variantTitle: "18K Gold Plated",
      sku: "TW-JWL-NOOR-01",
      slug: "royal-kundan-choker",
      image: "/test.jpg",
      price: 1500,
      mrp: 2500,
      quantity: 1,
      attributes: {},
      stockQuantity: 10,
      lowStockThreshold: 5,
      isAvailable: true,
      gstRatePercent: 3.0,
      itemTotal: 1500,
    },
    {
      id: "item_2",
      cartId: "cart_1",
      variantId: "var_2",
      productId: "prod_2",
      title: "Brass Urli",
      variantTitle: "Antique Finish",
      sku: "TW-DEC-URLI-01",
      slug: "brass-urli",
      image: "/test.jpg",
      price: 800,
      mrp: 1200,
      quantity: 2,
      attributes: {},
      stockQuantity: 10,
      lowStockThreshold: 5,
      isAvailable: true,
      gstRatePercent: 12.0,
      itemTotal: 1600,
    },
  ];

  it("calculates accurate subtotal from server prices", () => {
    // 1500 * 1 + 800 * 2 = 3100
    const { calculation } = calculateCartFinancials(mockItems);
    expect(calculation.subtotal).toBe(3100);
  });

  it("applies free shipping when subtotal exceeds threshold (₹999)", () => {
    const { calculation } = calculateCartFinancials(mockItems);
    expect(calculation.isFreeShipping).toBe(true);
    expect(calculation.shippingFee).toBe(0);
    expect(calculation.remainingForFreeShipping).toBe(0);
  });

  it("charges standard shipping (₹99) when net merchandise is below threshold", () => {
    const singleLowValueItem: CartItemDTO[] = [
      {
        ...mockItems[0],
        price: 500,
        quantity: 1,
        itemTotal: 500,
      },
    ];

    const { calculation } = calculateCartFinancials(singleLowValueItem);
    expect(calculation.subtotal).toBe(500);
    expect(calculation.isFreeShipping).toBe(false);
    expect(calculation.shippingFee).toBe(99);
    expect(calculation.remainingForFreeShipping).toBe(499);
    expect(calculation.grandTotal).toBe(599); // 500 + 99
  });

  it("applies percentage discount with maximum cap validation", () => {
    const percentageCoupon: CouponRule = {
      code: "TINIWISH15",
      discountType: "PERCENTAGE",
      discountValue: 15, // 15% of 3100 = 465
      minOrderAmount: 2000,
      maxDiscountCap: 400, // Capped at 400
      isActive: true,
    };

    const { calculation, appliedCoupon } = calculateCartFinancials(mockItems, percentageCoupon);
    expect(appliedCoupon).not.toBeNull();
    expect(appliedCoupon?.code).toBe("TINIWISH15");
    expect(calculation.discountAmount).toBe(400); // Clamped by max cap
    expect(calculation.grandTotal).toBe(2700); // 3100 - 400 + 0
  });

  it("applies fixed amount discount correctly", () => {
    const fixedCoupon: CouponRule = {
      code: "FLAT200",
      discountType: "FIXED_AMOUNT",
      discountValue: 200,
      minOrderAmount: 1000,
      isActive: true,
    };

    const { calculation, appliedCoupon } = calculateCartFinancials(mockItems, fixedCoupon);
    expect(appliedCoupon?.code).toBe("FLAT200");
    expect(calculation.discountAmount).toBe(200);
    expect(calculation.grandTotal).toBe(2900); // 3100 - 200
  });

  it("rejects coupon if subtotal is below minOrderAmount", () => {
    const highMinOrderCoupon: CouponRule = {
      code: "BIGSPENDER",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderAmount: 5000,
      isActive: true,
    };

    const { calculation, appliedCoupon } = calculateCartFinancials(mockItems, highMinOrderCoupon);
    expect(appliedCoupon).toBeNull();
    expect(calculation.discountAmount).toBe(0);
  });

  it("calculates statutory GST tax breakdown (CGST 50% + SGST 50%)", () => {
    const { calculation } = calculateCartFinancials(mockItems);
    expect(calculation.taxAmount).toBeGreaterThan(0);
    expect(calculation.cgstAmount).toBeGreaterThan(0);
    expect(calculation.sgstAmount).toBeGreaterThan(0);
    expect(calculation.cgstAmount + calculation.sgstAmount).toBeCloseTo(calculation.taxAmount, 2);
  });

  it("handles empty cart safely with 0 grand total", () => {
    const { calculation, appliedCoupon } = calculateCartFinancials([]);
    expect(calculation.subtotal).toBe(0);
    expect(calculation.discountAmount).toBe(0);
    expect(calculation.shippingFee).toBe(99);
    expect(calculation.grandTotal).toBe(99);
    expect(appliedCoupon).toBeNull();
  });
});

