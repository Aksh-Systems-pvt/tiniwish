import { describe, it, expect } from "vitest";
import { GET as getCart, DELETE as clearCart } from "@/app/api/v1/cart/route";
import { POST as addItem } from "@/app/api/v1/cart/items/route";
import { PATCH as updateItem, DELETE as removeItem } from "@/app/api/v1/cart/items/[id]/route";
import { POST as applyCoupon, DELETE as removeCoupon } from "@/app/api/v1/cart/coupon/route";
import { POST as mergeCart } from "@/app/api/v1/cart/merge/route";

describe("Shopping Cart API v1 Integration Tests", () => {
  const sessionToken = "api_test_session_token_123";

  it("GET /api/v1/cart retrieves cart and establishes session", async () => {
    const request = new Request("http://localhost/api/v1/cart", {
      headers: { "x-cart-session": sessionToken },
    });
    const response = await getCart(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("items");
    expect(json.data).toHaveProperty("calculation");
    expect(json.data).toHaveProperty("itemCount");
  });

  it("POST /api/v1/cart/items adds a product variant to the cart", async () => {
    const request = new Request("http://localhost/api/v1/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cart-session": sessionToken,
      },
      body: JSON.stringify({
        variantId: "var_noor_gold_emerald",
        quantity: 1,
      }),
    });
    const response = await addItem(request);

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.items.length).toBeGreaterThan(0);
    expect(json.data.calculation.subtotal).toBeGreaterThan(0);
  });

  it("POST /api/v1/cart/items rejects invalid or negative quantity", async () => {
    const request = new Request("http://localhost/api/v1/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cart-session": sessionToken,
      },
      body: JSON.stringify({
        variantId: "var_noor_gold_emerald",
        quantity: -5,
      }),
    });
    const response = await addItem(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("PATCH /api/v1/cart/items/[id] updates item quantity", async () => {
    // 1. Get current item ID
    const getReq = new Request("http://localhost/api/v1/cart", {
      headers: { "x-cart-session": sessionToken },
    });
    const getRes = await getCart(getReq);
    const getJson = await getRes.json();
    const itemId = getJson.data.items[0].id;

    // 2. Update quantity to 3
    const updateReq = new Request(`http://localhost/api/v1/cart/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-cart-session": sessionToken,
      },
      body: JSON.stringify({ quantity: 3 }),
    });
    const updateRes = await updateItem(updateReq, {
      params: Promise.resolve({ id: itemId }),
    });

    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.data.items[0].quantity).toBe(3);
  });

  it("POST /api/v1/cart/coupon applies coupon and recalculates financials", async () => {
    const request = new Request("http://localhost/api/v1/cart/coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cart-session": sessionToken,
      },
      body: JSON.stringify({ code: "TINIWISH10" }),
    });
    const response = await applyCoupon(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.appliedCoupon?.code).toBe("TINIWISH10");
    expect(json.data.calculation.discountAmount).toBeGreaterThan(0);
  });

  it("DELETE /api/v1/cart/coupon removes the coupon", async () => {
    const request = new Request("http://localhost/api/v1/cart/coupon", {
      method: "DELETE",
      headers: { "x-cart-session": sessionToken },
    });
    const response = await removeCoupon(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.appliedCoupon).toBeNull();
  });

  it("DELETE /api/v1/cart/items/[id] removes a single item from the cart", async () => {
    const getReq = new Request("http://localhost/api/v1/cart", {
      headers: { "x-cart-session": sessionToken },
    });
    const getRes = await getCart(getReq);
    const getJson = await getRes.json();
    const itemId = getJson.data.items[0].id;

    const delReq = new Request(`http://localhost/api/v1/cart/items/${itemId}`, {
      method: "DELETE",
      headers: { "x-cart-session": sessionToken },
    });
    const delRes = await removeItem(delReq, {
      params: Promise.resolve({ id: itemId }),
    });

    expect(delRes.status).toBe(200);
    const delJson = await delRes.json();
    expect(delJson.data.items.length).toBe(0);
  });

  it("POST /api/v1/cart/merge merges guest cart after authenticated login", async () => {
    const guestMergeToken = `guest_token_merge_${Date.now()}`;

    // Add item to guest session
    const addGuestReq = new Request("http://localhost/api/v1/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cart-session": guestMergeToken,
      },
      body: JSON.stringify({
        variantId: "var_noor_gold_emerald",
        quantity: 2,
      }),
    });
    await addItem(addGuestReq);

    // Merge request with mock authenticated user
    const mergeReq = new Request("http://localhost/api/v1/cart/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mock-user-id": "usr_auth_merge_test",
        "x-mock-user-email": "customer@tiniwish.com",
        "x-mock-user-role": "CUSTOMER",
      },
      body: JSON.stringify({ sessionToken: guestMergeToken }),
    });
    const mergeRes = await mergeCart(mergeReq);

    expect(mergeRes.status).toBe(200);
    const mergeJson = await mergeRes.json();
    expect(mergeJson.success).toBe(true);
    expect(mergeJson.data.items.length).toBeGreaterThan(0);
  });

  it("DELETE /api/v1/cart empties the entire cart", async () => {
    const request = new Request("http://localhost/api/v1/cart", {
      method: "DELETE",
      headers: { "x-cart-session": sessionToken },
    });
    const response = await clearCart(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.items.length).toBe(0);
    expect(json.data.calculation.subtotal).toBe(0);
  });
});

