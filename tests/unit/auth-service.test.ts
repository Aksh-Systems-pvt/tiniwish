/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/services/auth.service";
import { userRepository } from "@/repositories/user.repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { Role } from "@prisma/client";

vi.mock("@/repositories/user.repository", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findBySupabaseUid: vi.fn(),
    findById: vi.fn(),
    findByIdWithDetails: vi.fn(),
    createCustomer: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        updateUserById: vi.fn().mockResolvedValue({}),
      },
    },
  })),
}));

describe("AuthService Unit Tests", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe("register", () => {
    it("throws ConflictError if email is already registered", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce({
        id: "usr_1",
        email: "existing@tiniwish.com",
      } as any);

      await expect(
        authService.register({
          email: "existing@tiniwish.com",
          password: "Password123",
          firstName: "Existing",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("creates user with Role.CUSTOMER upon valid registration", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);

      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValueOnce({
            data: {
              user: { id: "sb_uid_123" },
              session: { access_token: "token_abc" },
            },
            error: null,
          }),
        },
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValueOnce(mockSupabase as any);

      vi.mocked(userRepository.createCustomer).mockResolvedValueOnce({
        id: "usr_new",
        supabaseUid: "sb_uid_123",
        email: "new@tiniwish.com",
        firstName: "New",
        lastName: "Customer",
        role: Role.CUSTOMER,
        isActive: true,
      } as any);

      const result = await authService.register({
        email: "new@tiniwish.com",
        password: "Password123",
        firstName: "New",
        lastName: "Customer",
      });

      expect(userRepository.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@tiniwish.com",
          supabaseUid: "sb_uid_123",
          firstName: "New",
        })
      );
      expect(result.user.role).toBe(Role.CUSTOMER);
      expect(result.session).toBeDefined();
    });
  });

  describe("login", () => {
    it("throws UnauthorizedError when credentials are invalid", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValueOnce({
            data: { user: null, session: null },
            error: { message: "Invalid credentials" },
          }),
        },
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValueOnce(mockSupabase as any);

      await expect(
        authService.login({
          email: "test@tiniwish.com",
          password: "wrongPassword",
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws ForbiddenError when account has been deactivated", async () => {
      const mockSignOut = vi.fn();
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValueOnce({
            data: {
              user: { id: "sb_deactivated_123" },
              session: { access_token: "token" },
            },
            error: null,
          }),
          signOut: mockSignOut,
        },
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValueOnce(mockSupabase as any);

      vi.mocked(userRepository.findBySupabaseUid).mockResolvedValueOnce({
        id: "usr_deact",
        supabaseUid: "sb_deactivated_123",
        email: "deactivated@tiniwish.com",
        isActive: false, // Deactivated
        deletedAt: null,
        role: Role.CUSTOMER,
      } as any);

      await expect(
        authService.login({
          email: "deactivated@tiniwish.com",
          password: "password123",
        })
      ).rejects.toThrow(ForbiddenError);

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("syncOAuthUser", () => {
    it("throws UnauthorizedError if email is missing from OAuth profile", async () => {
      await expect(
        authService.syncOAuthUser({ id: "oauth_123", email: undefined })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws ForbiddenError if existing OAuth user is inactive", async () => {
      vi.mocked(userRepository.findBySupabaseUid).mockResolvedValueOnce({
        id: "usr_1",
        email: "inactive@tiniwish.com",
        isActive: false,
        deletedAt: null,
      } as any);

      await expect(
        authService.syncOAuthUser({ id: "oauth_123", email: "inactive@tiniwish.com" })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getProfile", () => {
    it("throws NotFoundError if profile is not found", async () => {
      vi.mocked(userRepository.findByIdWithDetails).mockResolvedValueOnce(null);

      await expect(authService.getProfile("non_existent")).rejects.toThrow(NotFoundError);
    });

    it("returns formatted profile details with stats", async () => {
      vi.mocked(userRepository.findByIdWithDetails).mockResolvedValueOnce({
        id: "usr_1",
        email: "patron@tiniwish.com",
        phone: "9876543210",
        firstName: "Aarav",
        lastName: "Mehta",
        role: Role.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        addresses: [],
        orders: [],
        _count: {
          orders: 3,
          reviews: 1,
        },
      } as any);

      const profile = await authService.getProfile("usr_1");
      expect(profile.id).toBe("usr_1");
      expect(profile.stats.totalOrders).toBe(3);
    });
  });
});
