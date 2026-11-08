import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { buttonVariants, Button } from "@/components/ui/button"
import { badgeVariants, Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { toast, ToastProvider } from "@/components/ui/toast"
import { Gem } from "lucide-react"

describe("TiniWish Luxury Design System Components", () => {
  describe("Button & buttonVariants", () => {
    it("generates correct class names for luxury variants", () => {
      const defaultClasses = buttonVariants({ variant: "default" })
      expect(defaultClasses).toContain("bg-charcoal")

      const goldClasses = buttonVariants({ variant: "gold" })
      expect(goldClasses).toContain("bg-muted-gold")

      const secondaryClasses = buttonVariants({ variant: "secondary" })
      expect(secondaryClasses).toContain("bg-secondary-bg")

      const outlineClasses = buttonVariants({ variant: "outline" })
      expect(outlineClasses).toContain("border-champagne")

      const darkBrownClasses = buttonVariants({ variant: "darkBrown" })
      expect(darkBrownClasses).toContain("bg-dark-brown")
    })

    it("renders Button and triggers click event", () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Shop Jewellery</Button>)

      const button = screen.getByRole("button", { name: "Shop Jewellery" })
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("Badge & badgeVariants", () => {
    it("generates correct class names for luxury badge variants", () => {
      const goldClasses = badgeVariants({ variant: "gold" })
      expect(goldClasses).toContain("bg-muted-gold")

      const champagneClasses = badgeVariants({ variant: "champagne" })
      expect(champagneClasses).toContain("bg-champagne")

      const pillClasses = badgeVariants({ variant: "pill" })
      expect(pillClasses).toContain("rounded-full")
    })

    it("renders Badge with text", () => {
      render(<Badge variant="gold">Handcrafted</Badge>)
      expect(screen.getByText("Handcrafted")).toBeDefined()
    })
  })

  describe("EmptyState Component", () => {
    it("renders title, description, and custom icon", () => {
      render(
        <EmptyState
          icon={Gem}
          title="No Treasures Found"
          description="Try broadening your filters or explore other categories."
        />
      )

      expect(screen.getByText("No Treasures Found")).toBeDefined()
      expect(screen.getByText("Try broadening your filters or explore other categories.")).toBeDefined()
    })
  })

  describe("ErrorState Component", () => {
    it("renders full error state with retry button", () => {
      const handleRetry = vi.fn()
      render(
        <ErrorState
          errorCode={500}
          title="Server Issue"
          message="Could not reach the catalogue."
          onRetry={handleRetry}
        />
      )

      expect(screen.getByText("Server Issue")).toBeDefined()
      expect(screen.getByText("Error 500")).toBeDefined()

      const retryBtn = screen.getByRole("button", { name: /Try Again/i })
      fireEvent.click(retryBtn)
      expect(handleRetry).toHaveBeenCalledTimes(1)
    })

    it("renders inline banner error state", () => {
      render(
        <ErrorState
          variant="banner"
          title="Payment Failed"
          message="Card expired."
        />
      )

      expect(screen.getByText("Payment Failed:")).toBeDefined()
      expect(screen.getByText("Card expired.")).toBeDefined()
    })
  })

  describe("Toast Notification System", () => {
    it("renders ToastProvider and receives toast notifications", async () => {
      render(
        <ToastProvider>
          <div>App content</div>
        </ToastProvider>
      )

      expect(screen.getByText("App content")).toBeDefined()

      // Trigger toast
      act(() => {
        toast.cart("Item Added", "Royal Kundan Choker added to bag.")
      })

      // Verify toast appeared
      expect(await screen.findByText("Item Added")).toBeDefined()
      expect(screen.getByText("Royal Kundan Choker added to bag.")).toBeDefined()
    })
  })
})
