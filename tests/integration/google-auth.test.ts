// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET as initiateGoogleAuth } from "@/app/api/auth/google/route";
import { GET as handleGoogleCallback } from "@/app/api/auth/google/callback/route";
import { authService } from "@/services/auth.service";
import { Role } from "@prisma/client";

vi.mock("@/services/auth.service", () => ({
  authService: {
    syncOAuthUser: vi.fn(),
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        generateLink: vi.fn().mockResolvedValue({
          data: {
            user: { id: "sb_user_google_123" },
            properties: {
              hashed_token: "mock_hashed_token_123",
              verification_type: "magiclink",
            },
          },
          error: null,
        }),
      },
    },
  })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: {
      verifyOtp: vi.fn().mockResolvedValue({
        data: {
          user: { id: "sb_user_google_123", email: "priya.sharma@gmail.com" },
          session: { access_token: "mock_jwt_token" },
        },
        error: null,
      }),
    },
  }),
}));

// Mock next/headers cookies
const mockCookieMap = new Map<string, any>();
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: (key: string) => (mockCookieMap.has(key) ? { value: mockCookieMap.get(key) } : undefined),
    set: (key: string, value: any) => mockCookieMap.set(key, value),
    delete: (key: string) => mockCookieMap.delete(key),
  }),
}));

describe("Direct Google OAuth 2.0 Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieMap.clear();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("GET /api/auth/google (Initiation)", () => {
    it("redirects to login with error when GOOGLE_CLIENT_ID is not configured", async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      const request = new Request("http://localhost:3000/api/auth/google?next=/checkout");
      const response = await initiateGoogleAuth(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/login?error=google_oauth_not_configured");
    });

    it("redirects directly to Google accounts authorization server without Supabase in redirect chain", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

      const request = new Request("http://localhost:3000/api/auth/google?next=/checkout");
      const response = await initiateGoogleAuth(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(location).not.toContain("supabase.co");

      const url = new URL(location);
      expect(url.searchParams.get("client_id")).toBe("test-client-id.apps.googleusercontent.com");
      expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3000/api/auth/google/callback");
      expect(url.searchParams.get("response_type")).toBe("code");
      expect(url.searchParams.get("scope")).toContain("openid email profile");

      // Verifies CSRF state token cookie was set
      expect(mockCookieMap.has("google_oauth_state")).toBe(true);
    });
  });

  describe("GET /api/auth/google/callback", () => {
    it("handles Google cancellation or access_denied gracefully", async () => {
      const request = new Request("http://localhost:3000/api/auth/google/callback?error=access_denied");
      const response = await handleGoogleCallback(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/login?error=access_denied");
    });

    it("rejects request if CSRF state token does not match cookie", async () => {
      mockCookieMap.set("google_oauth_state", "real_token_123");

      const forgedState = Buffer.from(
        JSON.stringify({ token: "attacker_token_999", next: "/account" })
      ).toString("base64url");

      const request = new Request(
        `http://localhost:3000/api/auth/google/callback?code=mock_auth_code&state=${forgedState}`
      );
      const response = await handleGoogleCallback(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/login?error=invalid_oauth_state");
    });

    it("successfully exchanges code directly with Google and signs in customer", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
      process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

      const validToken = "valid_secure_state_token_456";
      mockCookieMap.set("google_oauth_state", validToken);

      const statePayload = Buffer.from(
        JSON.stringify({ token: validToken, next: "/checkout/payment" })
      ).toString("base64url");

      // Mock Google OAuth token exchange and userinfo responses
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("oauth2.googleapis.com/token")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: "google_access_token_xyz" }),
          } as Response);
        }
        if (url.includes("googleapis.com/oauth2/v3/userinfo")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                sub: "google_uid_789",
                email: "priya.sharma@gmail.com",
                email_verified: true,
                name: "Priya Sharma",
                given_name: "Priya",
                family_name: "Sharma",
                picture: "https://lh3.googleusercontent.com/avatar",
              }),
          } as Response);
        }
        return originalFetch(url);
      });

      try {
        vi.mocked(authService.syncOAuthUser).mockResolvedValueOnce({
          id: "usr_priya_1",
          email: "priya.sharma@gmail.com",
          firstName: "Priya",
          lastName: "Sharma",
          phone: null,
          role: Role.CUSTOMER,
          supabaseUid: "sb_user_google_123",
          isActive: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const request = new Request(
          `http://localhost:3000/api/auth/google/callback?code=google_auth_code_123&state=${statePayload}`
        );
        const response = await handleGoogleCallback(request);

        expect(response.status).toBe(307);
        const location = response.headers.get("location");
        expect(location).toBe("http://localhost:3000/checkout/payment");

        // Verify syncOAuthUser was invoked with verified Google profile
        expect(authService.syncOAuthUser).toHaveBeenCalledWith({
          id: "sb_user_google_123",
          email: "priya.sharma@gmail.com",
          user_metadata: {
            first_name: "Priya",
            last_name: "Sharma",
            avatar_url: "https://lh3.googleusercontent.com/avatar",
          },
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
