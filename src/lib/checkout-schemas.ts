import { z } from "zod";

export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export const checkoutAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  phone: z
    .string()
    .trim()
    .regex(
      INDIAN_PHONE_REGEX,
      "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)"
    ),
  pincode: z
    .string()
    .trim()
    .regex(
      INDIAN_PINCODE_REGEX,
      "Please enter a valid 6-digit Indian PIN code (e.g., 110001)"
    ),
  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(60, "State name is too long"),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(60, "City name is too long"),
  addressLine1: z
    .string()
    .trim()
    .min(2, "House, building or apartment details are required")
    .max(120, "Address line is too long"),
  addressLine2: z
    .string()
    .trim()
    .min(2, "Street, area or locality details are required")
    .max(120, "Address line is too long"),
  landmark: z.string().trim().max(100, "Landmark is too long").optional().nullable(),
  addressType: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  saveToProfile: z.boolean().optional(),
});

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(
      INDIAN_PHONE_REGEX,
      "Please enter a valid 10-digit Indian mobile number"
    ),
});

export const checkoutCalculationSchema = z.object({
  pincode: z
    .string()
    .trim()
    .regex(INDIAN_PINCODE_REGEX, "Please provide a valid 6-digit PIN code"),
  couponCode: z.string().trim().optional().nullable(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]).default("RAZORPAY"),
  isGiftWrapped: z.boolean().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .optional(),
});

export const createOrderSchema = z.object({
  idempotencyKey: z
    .string()
    .trim()
    .min(8, "Idempotency key is required to prevent duplicate orders"),
  customer: checkoutCustomerSchema,
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().trim().optional().nullable(),
  isGiftWrapped: z.boolean().optional(),
  giftOptions: z
    .object({
      recipientName: z.string().trim().optional(),
      senderName: z.string().trim().optional(),
      message: z.string().trim().optional(),
    })
    .optional()
    .nullable(),
  notes: z.string().trim().max(300, "Notes cannot exceed 300 characters").optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

