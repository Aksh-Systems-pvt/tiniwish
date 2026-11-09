import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { SearchModal } from "@/components/layout/search-modal";
import { StoreProvider } from "@/context/store-context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/image to render standard img tag
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("TiniWish Global Website Layout Components", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("AnnouncementBar", () => {
    it("renders promotional announcement bar with accessible elements", () => {
      render(<AnnouncementBar />);
      const aside = screen.getByLabelText("Promotional Announcement");
      expect(aside).toBeDefined();
      expect(screen.getByText(/Complimentary Luxury Gift Box/i)).toBeDefined();
    });

    it("has next and previous announcement navigation buttons", () => {
      render(<AnnouncementBar />);
      const prevBtn = screen.getByLabelText("Previous announcement");
      const nextBtn = screen.getByLabelText("Next announcement");
      expect(prevBtn).toBeDefined();
      expect(nextBtn).toBeDefined();

      fireEvent.click(nextBtn);
      expect(screen.getByText(/Free Express Shipping Across India/i)).toBeDefined();
    });
  });

  describe("Header & Navigation", () => {
    it("renders brand logo and navigation links", () => {
      render(
        <StoreProvider>
          <Header />
        </StoreProvider>
      );

      // Logo check
      const logos = screen.getAllByText("TiniWish");
      expect(logos.length).toBeGreaterThan(0);

      // Logo Image check
      const logoImgs = screen.getAllByAltText("TiniWish Logo");
      expect(logoImgs.length).toBeGreaterThan(0);
      expect(logoImgs[0].getAttribute("src")).toBe("/icons/logo.png");

      // Desktop links check
      expect(screen.getByText("All Collections")).toBeDefined();
    });

    it("renders action buttons with accessible labels", () => {
      render(
        <StoreProvider>
          <Header />
        </StoreProvider>
      );

      expect(screen.getByLabelText("Search Collection")).toBeDefined();
      expect(screen.getByLabelText("My Account")).toBeDefined();
      expect(screen.getByLabelText(/Wishlist/i)).toBeDefined();
      expect(screen.getByLabelText(/Shopping Bag/i)).toBeDefined();
    });

    it("opens search modal when clicking the search trigger", () => {
      render(
        <StoreProvider>
          <Header />
        </StoreProvider>
      );

      const searchBtn = screen.getByLabelText("Search Collection");
      fireEvent.click(searchBtn);

      expect(screen.getByPlaceholderText(/Search by product name, SKU/i)).toBeDefined();
    });
  });

  describe("NavDropdown (Mega Dropdown)", () => {
    const mockSections = [
      {
        title: "Neckpieces",
        items: [
          { label: "Kundan Chokers", href: "/jewellery?sub=chokers", badge: "New" },
          { label: "Temple Necklaces", href: "/jewellery?sub=necklaces" },
        ],
      },
    ];

    it("renders trigger label and opens mega dropdown panel on hover", () => {
      render(
        <NavDropdown
          label="Jewellery"
          href="/jewellery"
          sections={mockSections}
          featuredImage={{
            src: "/images/test.jpg",
            title: "The Kundan Edit",
            subtitle: "Bridal Heirlooms",
            href: "/jewellery",
          }}
        />
      );

      const trigger = screen.getByRole("link", { name: /Jewellery/i });
      expect(trigger).toBeDefined();

      // Trigger hover
      fireEvent.mouseEnter(trigger.parentElement!);

      expect(screen.getByText("Neckpieces")).toBeDefined();
      expect(screen.getByText("Kundan Chokers")).toBeDefined();
      expect(screen.getByText("The Kundan Edit")).toBeDefined();
      expect(screen.getByText("View All Jewellery")).toBeDefined();
    });
  });

  describe("SearchModal", () => {
    it("renders popular inquiries when query is empty", () => {
      render(<SearchModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/Popular Inquiries/i)).toBeDefined();
      expect(screen.getByText("Kundan Choker")).toBeDefined();
      expect(screen.getByText("Under ₹1,999")).toBeDefined();
    });

    it("calls onClose when ESC button is clicked", () => {
      const handleClose = vi.fn();
      render(<SearchModal isOpen={true} onClose={handleClose} />);

      const escBtn = screen.getByText("ESC");
      fireEvent.click(escBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("Footer", () => {
    it("renders brand value pillars, description, categories, and policies", () => {
      render(<Footer />);

      // Brand tagline
      expect(screen.getByText(/Little wishes\. Timeless treasures\./i)).toBeDefined();

      // Value pillars
      expect(screen.getByText(/Signature Gift Packaging/i)).toBeDefined();
      expect(screen.getByText(/Insured Pan-India Express/i)).toBeDefined();
      expect(screen.getByText(/100% Encrypted Checkout/i)).toBeDefined();
      expect(screen.getByText(/7-Day Easy Replacements/i)).toBeDefined();

      // Categories
      expect(screen.getByRole("link", { name: "Artificial Jewellery" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Charming Gifts" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Timeless Home Décor" })).toBeDefined();

      // Customer care & policies
      expect(screen.getByRole("link", { name: "Track Your Order" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Shipping & Express Delivery" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Returns & Replacements" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Terms & Conditions" })).toBeDefined();

      // Concierge Desk & Indian Entity
      expect(screen.getByText(/\+91 8000 123 456/i)).toBeDefined();
      expect(screen.getByText(/TiniWish Luxury Retails LLP/i)).toBeDefined();
      expect(screen.getByText(/GSTIN: 06AAACT0000A1Z5/i)).toBeDefined();
    });

    it("validates newsletter email input on client side", async () => {
      render(<Footer />);

      const form = screen.getByRole("button", { name: /Join Circle/i }).closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeDefined();
      });
    });

    it("submits newsletter successfully when valid email provided", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: "Welcome to the TiniWish Circle",
        }),
      });

      render(<Footer />);

      const input = screen.getByPlaceholderText(/Enter your email address/i);
      const subscribeBtn = screen.getByRole("button", { name: /Join Circle/i });

      fireEvent.change(input, { target: { value: "royalty@tiniwish.com" } });
      fireEvent.click(subscribeBtn);

      await waitFor(() => {
        expect(screen.getByText(/Welcome to the TiniWish Circle/i)).toBeDefined();
      });
    });
  });
});
