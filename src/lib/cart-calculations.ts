import { CartItemDTO, AppliedCouponDTO, CartCalculationDTO } from "@/types/cart";

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;

export interface CouponRule {
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountCap?: number | null;
  isActive: boolean;
  expiresAt?: Date | string | null;
}

/**
 * Calculates financial totals on the server.
 * Never trust client prices or client calculations.
 */
export function calculateCartFinancials(
  items: CartItemDTO[],
  couponRule?: CouponRule | null
): {
  calculation: CartCalculationDTO;
  appliedCoupon: AppliedCouponDTO | null;
} {
  // 1. Calculate Authoritative Subtotal from server item prices
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  // 2. Evaluate Coupon Application & Discounts
  let discountAmount = 0;
  let appliedCoupon: AppliedCouponDTO | null = null;
  let isFreeShippingByCoupon = false;

  if (couponRule && couponRule.isActive && subtotal > 0) {
    const isExpired = couponRule.expiresAt
      ? new Date(couponRule.expiresAt).getTime() < Date.now()
      : false;

    const meetsMinOrder =
      !couponRule.minOrderAmount || subtotal >= Number(couponRule.minOrderAmount);

    if (!isExpired && meetsMinOrder) {
      if (couponRule.discountType === "PERCENTAGE") {
        let rawDiscount = (subtotal * Number(couponRule.discountValue)) / 100;
        if (couponRule.maxDiscountCap) {
          rawDiscount = Math.min(rawDiscount, Number(couponRule.maxDiscountCap));
        }
        discountAmount = Math.round(rawDiscount);
      } else if (couponRule.discountType === "FIXED_AMOUNT") {
        discountAmount = Math.min(subtotal, Number(couponRule.discountValue));
      } else if (couponRule.discountType === "FREE_SHIPPING") {
        isFreeShippingByCoupon = true;
      }

      appliedCoupon = {
        code: couponRule.code,
        description: couponRule.description,
        discountType: couponRule.discountType,
        discountValue: Number(couponRule.discountValue),
        discountAmount,
        minOrderAmount: couponRule.minOrderAmount ? Number(couponRule.minOrderAmount) : null,
        maxDiscountCap: couponRule.maxDiscountCap ? Number(couponRule.maxDiscountCap) : null,
      };
    }
  }

  // 3. Calculate Shipping Fee
  const netMerchandise = Math.max(0, subtotal - discountAmount);
  const isFreeShipping = netMerchandise >= FREE_SHIPPING_THRESHOLD || isFreeShippingByCoupon;
  const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const remainingForFreeShipping = isFreeShipping
    ? 0
    : Math.max(0, FREE_SHIPPING_THRESHOLD - netMerchandise);

  // 4. Calculate Indian GST Tax Breakdown (CGST 50% + SGST 50%)
  // Prices are GST-inclusive; we calculate the embedded statutory GST for invoice transparency
  let totalTax = 0;
  for (const item of items) {
    const itemTotal = Number(item.price) * item.quantity;
    const gstRate = item.gstRatePercent || 3.0; // 3% for jewellery, 12% decor, 18% gifts
    const itemTax = (itemTotal * gstRate) / (100 + gstRate);
    totalTax += itemTax;
  }

  const roundedTax = Math.round(totalTax * 100) / 100;
  const cgstAmount = Math.round((roundedTax / 2) * 100) / 100;
  const sgstAmount = Math.round((roundedTax - cgstAmount) * 100) / 100;

  // 5. Calculate Grand Total
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    calculation: {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: roundedTax,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      shippingFee,
      isFreeShipping,
      remainingForFreeShipping,
      grandTotal: Math.round(grandTotal * 100) / 100,
    },
    appliedCoupon,
  };
}

