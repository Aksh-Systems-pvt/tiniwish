import { AppliedCouponDTO } from "./cart";

export type AddressType = "HOME" | "WORK" | "OTHER";
export type PaymentMethodType = "RAZORPAY" | "COD";
export type OrderStatusType =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface CheckoutAddressDTO {
  id?: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  addressLine1: string; // House/Building/Flat
  addressLine2: string; // Street/Area/Locality
  landmark?: string | null;
  addressType: AddressType;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  saveToProfile?: boolean;
}

export interface CheckoutCustomerDTO {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutItemDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  title: string;
  variantTitle?: string;
  sku: string;
  image: string;
  sellingPrice: number;
  mrp?: number | null;
  gstRatePercent?: number;
}

export interface CheckoutCalculationDTO {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  shippingFee: number;
  codFee: number;
  giftFee: number;
  grandTotal: number;
  isFreeShipping: boolean;
  isCodAvailable: boolean;
  appliedCoupon: AppliedCouponDTO | null;
  estimatedDeliveryDays: string;
  estimatedDeliveryDate: string;
  courierName: string;
}

export interface CreateOrderRequestDTO {
  idempotencyKey: string;
  customer: CheckoutCustomerDTO;
  shippingAddress: CheckoutAddressDTO;
  billingAddress?: CheckoutAddressDTO;
  paymentMethod: PaymentMethodType;
  couponCode?: string | null;
  isGiftWrapped?: boolean;
  giftOptions?: {
    recipientName?: string;
    senderName?: string;
    message?: string;
  } | null;
  notes?: string | null;
  items?: CheckoutItemDTO[];
}

export interface OrderItemDTO {
  id: string;
  orderId: string;
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
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  idempotencyKey?: string | null;
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
  shippingAddressSnapshot: CheckoutAddressDTO;
  billingAddressSnapshot: CheckoutAddressDTO;
  couponCode?: string | null;
  isGiftWrapped: boolean;
  notes?: string | null;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
  razorpayOrderId?: string | null;
  razorpayKeyId?: string | null;
}

export interface VerifyPaymentRequestDTO {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

