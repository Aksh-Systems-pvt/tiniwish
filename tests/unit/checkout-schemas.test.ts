import { describe, it, expect } from "vitest";
import {
  checkoutAddressSchema,
  checkoutCustomerSchema,
  createOrderSchema,
} from "@/lib/checkout-schemas";

describe("Checkout Validation Schemas", () => {
  describe("checkoutAddressSchema (Indian Address Standards)", () => {
    it("validates a complete, valid Indian address", () => {
      const validAddress = {
        fullName: "Ananya Iyer",
        phone: "9876543210",
        pincode: "110001",
        state: "Delhi",
        city: "New Delhi",
        addressLine1: "Flat 402, Lotus Court",
        addressLine2: "Barakhamba Road, Connaught Place",
        landmark: "Near Metro Station Gate 2",
        addressType: "HOME",
        saveToProfile: true,
      };

      const result = checkoutAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it("rejects an invalid PIN code (alphanumeric, short, or starting with 0)", () => {
      const invalidPin1 = {
        fullName: "Ananya Iyer",
        phone: "9876543210",
        pincode: "11000", // 5 digits
        state: "Delhi",
        city: "New Delhi",
        addressLine1: "Flat 402",
        addressLine2: "Barakhamba Road",
      };
      expect(checkoutAddressSchema.safeParse(invalidPin1).success).toBe(false);

      const invalidPin2 = { ...invalidPin1, pincode: "010001" }; // starts with 0
      expect(checkoutAddressSchema.safeParse(invalidPin2).success).toBe(false);

      const invalidPin3 = { ...invalidPin1, pincode: "11000A" }; // letters
      expect(checkoutAddressSchema.safeParse(invalidPin3).success).toBe(false);
    });

    it("rejects invalid Indian mobile numbers", () => {
      const invalidPhone1 = {
        fullName: "Ananya Iyer",
        phone: "1234567890", // starts with 1
        pincode: "110001",
        state: "Delhi",
        city: "New Delhi",
        addressLine1: "Flat 402",
        addressLine2: "Barakhamba Road",
      };
      expect(checkoutAddressSchema.safeParse(invalidPhone1).success).toBe(false);

      const invalidPhone2 = { ...invalidPhone1, phone: "987654321" }; // 9 digits
      expect(checkoutAddressSchema.safeParse(invalidPhone2).success).toBe(false);
    });

    it("rejects empty house or street lines", () => {
      const missingHouse = {
        fullName: "Ananya Iyer",
        phone: "9876543210",
        pincode: "110001",
        state: "Delhi",
        city: "New Delhi",
        addressLine1: "",
        addressLine2: "Barakhamba Road",
      };
      expect(checkoutAddressSchema.safeParse(missingHouse).success).toBe(false);
    });
  });

  describe("checkoutCustomerSchema", () => {
    it("validates legitimate customer contact info", () => {
      const valid = {
        name: "Vikram Singhania",
        email: "vikram@example.com",
        phone: "9123456780",
      };
      expect(checkoutCustomerSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const invalid = {
        name: "Vikram Singhania",
        email: "not-an-email",
        phone: "9123456780",
      };
      expect(checkoutCustomerSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("createOrderSchema", () => {
    it("validates full order creation request with idempotencyKey", () => {
      const orderReq = {
        idempotencyKey: "client_req_token_987654321",
        customer: {
          name: "Vikram Singhania",
          email: "vikram@example.com",
          phone: "9123456780",
        },
        shippingAddress: {
          fullName: "Vikram Singhania",
          phone: "9123456780",
          pincode: "400001",
          state: "Maharashtra",
          city: "Mumbai",
          addressLine1: "Tower 2, Floor 18",
          addressLine2: "Nariman Point",
          addressType: "WORK",
        },
        paymentMethod: "RAZORPAY",
        couponCode: "WELCOME10",
        isGiftWrapped: true,
        items: [
          {
            productId: "prod_kundan_choker",
            quantity: 1,
          },
        ],
      };

      const result = createOrderSchema.safeParse(orderReq);
      expect(result.success).toBe(true);
    });

    it("rejects order creation without idempotencyKey", () => {
      const missingIdemp = {
        customer: {
          name: "Vikram",
          email: "vikram@example.com",
          phone: "9123456780",
        },
        shippingAddress: {
          fullName: "Vikram",
          phone: "9123456780",
          pincode: "400001",
          state: "Maharashtra",
          city: "Mumbai",
          addressLine1: "Tower 2",
          addressLine2: "Nariman Point",
          addressType: "HOME",
        },
        paymentMethod: "COD",
      };

      expect(createOrderSchema.safeParse(missingIdemp).success).toBe(false);
    });
  });
});

