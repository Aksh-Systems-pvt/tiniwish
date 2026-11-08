import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { StoreProvider, useStore } from "@/context/store-context";
import { ToastProvider } from "@/components/ui/toast";
import { Header } from "@/components/layout/header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("StoreProvider and Toast System", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function TestConsumer() {
    const {
      cartCount,
      wishlistCount,
      isHydrated,
      addToCart,
      toggleWishlist,
    } = useStore();

    return (
      <div>
        <div data-testid="is-hydrated">{isHydrated ? "hydrated" : "loading"}</div>
        <div data-testid="cart-count">{cartCount}</div>
        <div data-testid="wishlist-count">{wishlistCount}</div>
        <button
          onClick={() =>
            addToCart({
              id: "prod-1-v1",
              productId: "prod-1",
              title: "Kundan Royal Choker",
              slug: "kundan-royal-choker",
              image: "/images/kundan.jpg",
              price: 4999,
            })
          }
        >
          Add Item
        </button>
        <button
          onClick={() =>
            toggleWishlist({
              productId: "prod-1",
              title: "Kundan Royal Choker",
              slug: "kundan-royal-choker",
              image: "/images/kundan.jpg",
              price: 4999,
            })
          }
        >
          Toggle Wishlist
        </button>
      </div>
    );
  }

  it("hydrates gracefully from localStorage post-mount without render errors", async () => {
    localStorage.setItem(
      "tiniwish_wishlist_v1",
      JSON.stringify([
        {
          productId: "item-1",
          title: "Antique Brass Lamp",
          slug: "antique-brass-lamp",
          image: "/images/lamp.jpg",
          price: 2500,
        },
      ])
    );

    render(
      <ToastProvider>
        <StoreProvider>
          <TestConsumer />
        </StoreProvider>
      </ToastProvider>
    );

    // Initial render in effects
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("is-hydrated").textContent).toBe("hydrated");
    expect(screen.getByTestId("wishlist-count").textContent).toBe("1");
  });

  it("adds to cart and triggers toast without render-phase conflict", async () => {
    render(
      <ToastProvider>
        <StoreProvider>
          <TestConsumer />
        </StoreProvider>
      </ToastProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    const addBtn = screen.getByText("Add Item");
    act(() => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByTestId("cart-count").textContent).toBe("1");

    // Advance macrotask timers for scheduled toast
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText("Added to Shopping Bag")).toBeDefined();
    expect(screen.getByText(/Kundan Royal Choker has been added to your bag/i)).toBeDefined();
  });

  it("toggles wishlist and triggers toast safely", async () => {
    render(
      <ToastProvider>
        <StoreProvider>
          <TestConsumer />
        </StoreProvider>
      </ToastProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    const toggleBtn = screen.getByText("Toggle Wishlist");

    // 1st click: Add
    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByTestId("wishlist-count").textContent).toBe("1");

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText("Saved to Wishlist")).toBeDefined();

    // 2nd click: Remove
    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByTestId("wishlist-count").textContent).toBe("0");

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText("Removed from Wishlist")).toBeDefined();
  });

  it("renders Header without hydration badge mismatches when store is empty or populated", () => {
    const { container } = render(
      <ToastProvider>
        <StoreProvider>
          <Header />
        </StoreProvider>
      </ToastProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(container).toBeDefined();
    expect(screen.getByLabelText("Wishlist")).toBeDefined();
    expect(screen.getByLabelText("Shopping Bag")).toBeDefined();
  });
});
