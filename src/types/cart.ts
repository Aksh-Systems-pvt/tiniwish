export interface CartItemDTO {
  id: string;
  cartId: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  sku: string;
  slug: string;
  image: string;
  price: number; // Authoritative live selling price from DB
  mrp: number; // Authoritative MRP from DB
  quantity: number;
  attributes: Record<string, string>;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  gstRatePercent: number;
  itemTotal: number;
}

export interface AppliedCouponDTO {
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  discountAmount: number;
  minOrderAmount?: number | null;
  maxDiscountCap?: number | null;
}

export interface CartCalculationDTO {
  subtotal: number;
  discountAmount: number;
  taxAmount: number; // Total GST
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  shippingFee: number;
  isFreeShipping: boolean;
  remainingForFreeShipping: number;
  grandTotal: number;
}

export interface CartDTO {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  items: CartItemDTO[];
  itemCount: number; // Total quantity of items
  calculation: CartCalculationDTO;
  appliedCoupon: AppliedCouponDTO | null;
  hasUnavailableItems: boolean;
  updatedAt: string;
}

