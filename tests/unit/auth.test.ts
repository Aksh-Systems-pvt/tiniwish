import { describe, it, expect } from "vitest";
import { getAuthUser, requireAuth, requireRole } from "@/lib/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

describe("Authentication & Authorization Utilities", () => {
  it("extracts mock user in test/development environment", async () => {
    const request = new Request("http://localhost/api/test", {
      headers: {
        "x-mock-user-id": "usr_test123",
        "x-mock-user-email": "admin@tiniwish.com",
        "x-mock-user-role": "ADMIN",
      },
    });

    const user = await getAuthUser(request);
    expect(user).not.toBeNull();
    expect(user?.id).toBe("usr_test123");
    expect(user?.email).toBe("admin@tiniwish.com");
    expect(user?.role).toBe("ADMIN");
  });

  it("requireAuth throws UnauthorizedError when unauthenticated", async () => {
    const request = new Request("http://localhost/api/test");
    await expect(requireAuth(request)).rejects.toThrow(UnauthorizedError);
  });

  it("requireRole succeeds when role matches", async () => {
    const request = new Request("http://localhost/api/test", {
      headers: {
        "x-mock-user-id": "usr_test123",
        "x-mock-user-email": "admin@tiniwish.com",
        "x-mock-user-role": "ADMIN",
      },
    });

    const user = await requireRole(request, ["ADMIN"]);
    expect(user.role).toBe("ADMIN");
  });

  it("requireRole throws ForbiddenError when role does not match", async () => {
    const request = new Request("http://localhost/api/test", {
      headers: {
        "x-mock-user-id": "usr_customer1",
        "x-mock-user-email": "cust@tiniwish.com",
        "x-mock-user-role": "CUSTOMER",
      },
    });

    await expect(requireRole(request, ["ADMIN", "SUPPORT"])).rejects.toThrow(ForbiddenError);
  });
});

