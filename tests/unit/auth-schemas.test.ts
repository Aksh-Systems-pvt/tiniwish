import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "@/validators/auth.schema";

describe("Auth Validation Schemas", () => {
  describe("registerSchema", () => {
    it("validates valid registration inputs", () => {
      const valid = {
        email: "Customer@TiniWish.com",
        password: "SecurePassword123!",
        firstName: "Meera",
        lastName: "Patel",
        phone: "9876543210",
      };

      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("customer@tiniwish.com"); // trimmed & lowercased
        expect(result.data.firstName).toBe("Meera");
      }
    });

    it("rejects invalid email formats", () => {
      const invalid = {
        email: "not-an-email",
        password: "SecurePassword123",
        firstName: "Meera",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const invalid = {
        email: "valid@tiniwish.com",
        password: "Pass1",
        firstName: "Meera",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects passwords missing an uppercase letter", () => {
      const invalid = {
        email: "valid@tiniwish.com",
        password: "password123",
        firstName: "Meera",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects passwords missing a number", () => {
      const invalid = {
        email: "valid@tiniwish.com",
        password: "PasswordWithoutNumber",
        firstName: "Meera",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid Indian mobile numbers", () => {
      const invalid = {
        email: "valid@tiniwish.com",
        password: "Password123",
        firstName: "Meera",
        phone: "1234567890", // Does not start with 6-9
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("validates valid login data", () => {
      const valid = {
        email: "user@tiniwish.com",
        password: "password123",
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
      const invalid = {
        email: "user@tiniwish.com",
        password: "",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates correct email for forgot password", () => {
      const valid = { email: "reset@tiniwish.com" };
      const result = forgotPasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email for forgot password", () => {
      const invalid = { email: "not-an-email" };
      const result = forgotPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("accepts matching complex passwords", () => {
      const valid = {
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      };
      const result = resetPasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects mismatching passwords", () => {
      const invalid = {
        password: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      };
      const result = resetPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });
  });

  describe("updateProfileSchema", () => {
    it("accepts valid profile update fields", () => {
      const valid = {
        firstName: "Priya",
        lastName: "Sharma",
        phone: "9811122233",
      };
      const result = updateProfileSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid phone in profile update", () => {
      const invalid = {
        phone: "0000000000",
      };
      const result = updateProfileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

