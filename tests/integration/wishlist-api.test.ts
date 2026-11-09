import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getWishlist, DELETE as clearWishlist } from "@/app/api/v1/wishlist/route";
import { POST as addItem } from "@/app/api/v1/wishlist/items/route";
import { DELETE as removeItem } from "@/app/api/v1/wishlist/items/[id]/route";
import { POST as moveToCart } from "@/app/api/v1/wishlist/items/[id]/move-to-cart/route";
import { POST as mergeWishlist } from "@/app/api/v1/wishlist/merge/route";
import { WISHLIST_SESSION_COOKIE } from "@/lib/wishlist-session";

describe("Wishlist API Integration Tests", () => {
  const guestSessionA = "guest_api_session_alpha";
  const guestSessionB = "guest_api_session_beta";

  const createReq = (
    url: string,
    options: {
      method?: string;
      body?: Record<string, unknown>;
      sessionToken?: string;
    } = {}
  ) => {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (options.sessionToken) {
      headers.set("x-wishlist-session", options.sessionToken);
      headers.set("cookie", `${WISHLIST_SESSION_COOKIE}=${options.sessionToken}`);
    }

    return new NextRequest(new URL(url, "https://tiniwish.com"), {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  };

  beforeEach(async () => {
    // Clear test wishlists
    const reqA = createReq("https://tiniwish.com/api/v1/wishlist", {
      method: "DELETE",
      sessionToken: guestSessionA,
    });
    await clearWishlist(reqA);

    const reqB = createReq("https://tiniwish.com/api/v1/wishlist", {
      method: "DELETE",
      sessionToken: guestSessionB,
    });
    await clearWishlist(reqB);
  });

  it("GET /api/v1/wishlist returns empty wishlist for new guest session with Set-Cookie", async () => {
    const req = createReq("https://tiniwish.com/api/v1/wishlist");
    const res = await getWishlist(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.items).toEqual([]);
    expect(data.data.itemCount).toBe(0);

    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toContain(WISHLIST_SESSION_COOKIE);
  });

  it("POST /api/v1/wishlist/items adds a product to caller's wishlist", async () => {
    const req = createReq("https://tiniwish.com/api/v1/wishlist/items", {
      method: "POST",
      sessionToken: guestSessionA,
      body: { productId: "prod_kundan_choker" },
    });

    const res = await addItem(req);
    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.items.length).toBe(1);
    expect(data.data.items[0].productId).toBe("prod_kundan_choker");
  });

  it("DELETE /api/v1/wishlist/items/[id] removes product from caller's wishlist", async () => {
    // Add item first
    const addReq = createReq("https://tiniwish.com/api/v1/wishlist/items", {
      method: "POST",
      sessionToken: guestSessionA,
      body: { productId: "prod_kundan_choker" },
    });
    await addItem(addReq);

    // Remove item
    const delReq = createReq(
      "https://tiniwish.com/api/v1/wishlist/items/prod_kundan_choker",
      {
        method: "DELETE",
        sessionToken: guestSessionA,
      }
    );
    const res = await removeItem(delReq, {
      params: Promise.resolve({ id: "prod_kundan_choker" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.items.length).toBe(0);
  });

  it("POST /api/v1/wishlist/items/[id]/move-to-cart moves item from wishlist to cart", async () => {
    // Add to wishlist
    const addReq = createReq("https://tiniwish.com/api/v1/wishlist/items", {
      method: "POST",
      sessionToken: guestSessionA,
      body: { productId: "prod_polki_jhumka" },
    });
    await addItem(addReq);

    // Move to cart
    const moveReq = createReq(
      "https://tiniwish.com/api/v1/wishlist/items/prod_polki_jhumka/move-to-cart",
      {
        method: "POST",
        sessionToken: guestSessionA,
        body: { variantId: "var_chandrika_antique_gold" },
      }
    );

    const res = await moveToCart(moveReq, {
      params: Promise.resolve({ id: "prod_polki_jhumka" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.wishlist.items.length).toBe(0);
    expect(data.data.movedItem.productId).toBe("prod_polki_jhumka");
  });

  it("POST /api/v1/wishlist/merge requires authentication", async () => {
    const req = createReq("https://tiniwish.com/api/v1/wishlist/merge", {
      method: "POST",
      body: { guestSessionToken: "some_guest_token" },
    });

    const res = await mergeWishlist(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("Customer Isolation: Session B cannot see Session A's saved items", async () => {
    // Add to session A
    const addReq = createReq("https://tiniwish.com/api/v1/wishlist/items", {
      method: "POST",
      sessionToken: guestSessionA,
      body: { productId: "prod_brass_peacock_diya" },
    });
    await addItem(addReq);

    // Read session B
    const reqB = createReq("https://tiniwish.com/api/v1/wishlist", {
      sessionToken: guestSessionB,
    });
    const resB = await getWishlist(reqB);
    const dataB = await resB.json();

    expect(dataB.data.items.length).toBe(0);
  });
});
