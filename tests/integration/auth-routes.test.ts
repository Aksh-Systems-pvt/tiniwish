/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { POST as forgotPasswordHandler } from "@/app/api/auth/forgot-password/route";
import { GET as meGetHandler, PATCH as mePatchHandler } from "@/app/api/auth/me/route";
import { authService } from "@/services/auth.service";
import { Role } from "@prisma/client";

vi.mock("@/services/auth.service", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

describe("Auth API Route Handlers Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("returns 400 on invalid registration payload", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid-email" }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 201 on successful registration", async () => {
      vi.mocked(authService.register).mockResolvedValueOnce({
        user: {
          id: "usr_reg123",
          email: "customer@tiniwish.com",
          firstName: "Ananya",
          lastName: "Roy",
          role: Role.CUSTOMER,
        },
        session: { access_token: "token_xyz" } as any,
        requiresEmailVerification: false,
      });

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "customer@tiniwish.com",
          password: "SecurePassword123",
          firstName: "Ananya",
          lastName: "Roy",
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("customer@tiniwish.com");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 400 on missing login fields", async () => {
      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("returns 200 on successful login", async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: {
          id: "usr_log123",
          email: "customer@tiniwish.com",
          firstName: "Ananya",
          lastName: "Roy",
          role: Role.CUSTOMER,
        },
        session: { access_token: "token_abc" } as any,
      });

      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "customer@tiniwish.com",
          password: "Password123",
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("customer@tiniwish.com");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("returns 200 and calls authService.logout", async () => {
      vi.mocked(authService.logout).mockResolvedValueOnce();

      const response = await logoutHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("returns 400 on invalid email format", async () => {
      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid" }),
      });

      const response = await forgotPasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("returns 200 on valid email", async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce({
        message: "Reset link dispatched.",
      });

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "valid@tiniwish.com" }),
      });

      const response = await forgotPasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("GET & PATCH /api/auth/me", () => {
    it("GET /api/auth/me returns 401 when unauthenticated", async () => {
      const request = new Request("http://localhost/api/auth/me");
      const response = await meGetHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("GET /api/auth/me returns 200 with profile when authenticated", async () => {
      vi.mocked(authService.getProfile).mockResolvedValueOnce({
        id: "usr_mock",
        email: "mock@tiniwish.com",
        phone: null,
        firstName: "Mock",
        lastName: "User",
        role: Role.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        addresses: [],
        orders: [],
        stats: { totalOrders: 0, totalReviews: 0 },
      });

      const request = new Request("http://localhost/api/auth/me", {
        headers: {
          "x-mock-user-id": "usr_mock",
          "x-mock-user-email": "mock@tiniwish.com",
          "x-mock-user-role": "CUSTOMER",
        },
      });

      const response = await meGetHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe("mock@tiniwish.com");
    });

    it("PATCH /api/auth/me updates profile fields when authenticated", async () => {
      vi.mocked(authService.updateProfile).mockResolvedValueOnce({
        id: "usr_mock",
        email: "mock@tiniwish.com",
        firstName: "UpdatedName",
        lastName: "UpdatedLast",
        phone: "9876543210",
        role: Role.CUSTOMER,
      });

      const request = new Request("http://localhost/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user-id": "usr_mock",
          "x-mock-user-email": "mock@tiniwish.com",
          "x-mock-user-role": "CUSTOMER",
        },
        body: JSON.stringify({
          firstName: "UpdatedName",
          lastName: "UpdatedLast",
          phone: "9876543210",
        }),
      });

      const response = await mePatchHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe("UpdatedName");
    });
  });
});
