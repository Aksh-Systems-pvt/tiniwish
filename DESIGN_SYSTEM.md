# TiniWish Luxury Design System

> **Brand**: TiniWish  
> **Tagline**: *"Little wishes. Timeless treasures."*  
> **Aesthetic**: Minimal Luxury • Indian Heritage • Modern Sophistication  
> **Status**: Production Ready  

---

## 1. Design Philosophy & Golden Rules

1. **Luxury & Minimal**: Every visual element serves a purpose. Avoid visual noise, ornamentation for its own sake, or clutter.
2. **Restraint with Gold**: Gold (`#AE8958`) is an exquisite accent, never an overpowering flood. Use it selectively for ratings, active indicators, luxury badges, and focal CTAs.
3. **Refined Radii (No Bubbly Curves)**: Avoid oversized pill containers or hyper-rounded 24px/32px boxes for standard surfaces. Use crisp, tailored radii: `2px` (badges), `4px` (buttons/inputs), `8px` (cards/modals).
4. **Premium Whitespace**: Generous margins, deliberate breathing room, and spacious padding evoke high-end boutique retail.
5. **Subtle Motion & Hover**: Micro-interactions are gentle and silky (`200ms - 300ms ease-out`), like velvet. Avoid abrupt, snappy animations.
6. **Accessible Contrast**: Charcoal (`#292522`) and Dark Brown (`#514238`) guarantee WCAG AAA legibility against Primary Background (`#F7F3ED`) and Secondary Background (`#EFE7DC`).

---

## 2. Color Palette Tokens

| Token Name | Hex Code | RGB | Role & Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#F7F3ED` | `247, 243, 237` | Main canvas background across storefront and boutique pages. |
| **Secondary Background**| `#EFE7DC` | `239, 231, 220` | Subtle tinted sections, input fills, dropdown panels, and tab lists. |
| **Champagne** | `#D9C7AD` | `217, 199, 173` | Card borders, dividers, subtle outlines, selection highlights. |
| **Muted Gold** | `#AE8958` | `174, 137, 88` | Signature brand accent, star ratings, active filters, premium CTA buttons. |
| **Dark Brown** | `#514238` | `81, 66, 56` | Secondary typography, category tags, icons, luxury button hover states. |
| **Charcoal** | `#292522` | `41, 37, 34` | Primary high-contrast typography, primary buttons, footer background. |
| **White** | `#FFFFFF` | `255, 255, 255` | Elevated product cards, modal surfaces, form inputs. |

### Tailwind Color Utility Classes

```html
<!-- Primary & Secondary Backgrounds -->
<div className="bg-primary-bg text-charcoal">...</div>
<section className="bg-secondary-bg text-dark-brown">...</section>

<!-- Champagne Borders & Accents -->
<div className="border border-champagne text-charcoal">...</div>

<!-- Muted Gold Brand Accents -->
<span className="text-muted-gold font-medium">₹1,999</span>
<button className="bg-muted-gold text-white hover:bg-gold-hover">...</button>

<!-- Charcoal & Dark Brown -->
<h1 className="text-charcoal font-serif">...</h1>
<p className="text-dark-brown/70 font-sans">...</p>
```

---

## 3. Typography Scale & Hierarchy

### Fonts
- **Headings**: *Playfair Display* (`font-serif`, `--font-playfair`) — Editorial elegance, timeless Indian luxury.
- **Body Text**: *Inter* (`font-sans`, `--font-inter`, weights 300, 400, 500) — Ultra-clean readability at all sizes.
- **Buttons & Labels**: *Inter Medium* (`font-sans font-medium tracking-wide`, 500) — Crisp, deliberate CTA hierarchy.

### Type Scale Hierarchy

| Element | Class | Font Family | Weight | Size / Leading | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `text-5xl sm:text-7xl` | Playfair Display | 400 Regular | `3.5rem - 4.5rem / 1.1` | Homepage Hero, Editorial Headlines |
| **Heading 1** | `text-3xl sm:text-4xl` | Playfair Display | 400 Regular | `2rem - 2.5rem / 1.2` | Category Titles, Major Section Headers |
| **Heading 2** | `text-2xl sm:text-3xl` | Playfair Display | 500 Medium | `1.5rem - 1.875rem / 1.25`| Modal Headers, PDP Product Titles |
| **Heading 3** | `text-lg sm:text-xl` | Playfair Display | 500 Medium | `1.125rem - 1.25rem / 1.3` | Product Card Titles, Collection Sub-headings |
| **Body Large**| `text-base sm:text-lg`| Inter | 300 Light | `1rem - 1.125rem / 1.6` | Lead Paragraphs, Editorial Stories |
| **Body Regular**| `text-sm` | Inter | 400 Regular | `0.875rem / 1.5` | Descriptions, Reviews, General Copy |
| **Body Small**| `text-xs` | Inter | 400 Regular | `0.75rem / 1.4` | Helper Text, Pincode Notices, Snapshots |
| **Overline** | `text-[10px] tracking-widest uppercase` | Inter | 500 Medium | `0.625rem / 1` | Category Badges, Collection Tags, Dates |
| **Button Text**| `text-xs sm:text-sm tracking-wide` | Inter | 500 Medium | `0.875rem / 1` | Action Buttons, Checkout CTA |

---

## 4. Spacing System (4px Base Grid)

| Token | Class | Value | Primary Role |
| :--- | :--- | :--- | :--- |
| `2xs` | `p-1`, `gap-1` | `4px` | Fine badge gaps, icon padding |
| `xs` | `p-2`, `gap-2` | `8px` | Tight list gaps, inline pills |
| `sm` | `p-3`, `gap-3` | `12px` | Compact button padding, card subtitles |
| `md` | `p-4`, `gap-4` | `16px` | Standard input padding, product card padding |
| `lg` | `p-6`, `gap-6` | `24px` | Spacious card padding, modal content padding |
| `xl` | `p-8`, `gap-8` | `32px` | Desktop card margins, column grid gutters |
| `2xl` | `p-12`, `py-12` | `48px` | Section margins, empty state containers |
| `3xl` | `py-16`, `py-20` | `64px - 80px` | Standard page section vertical padding |
| `4xl` | `py-24`, `py-32` | `96px - 128px`| Hero banners, flagship collection showcases |

---

## 5. Border Radius System

To prevent the visual impression of cheap plastic or bubbly mobile app cards, TiniWish uses an intentional, structured scale:

```
none:    0px     → Dividers, full-bleed announcement banners
xs:      2px     → Fine badges, tag chips
sm:      3px     → Small buttons, input icons
md:      4px     → Standard inputs, buttons, filter chips
lg:      8px     → Product cards, modal dialogs, drawer panels
xl:      12px    → Hero card containers, flagship promo blocks
full:    9999px  → Wishlist floating icon buttons, pill chips
```

---

## 6. Luxury Shadows

Warm-tinted, diffuse shadows mimicking ambient natural indoor gallery illumination:

```css
--shadow-subtle: 0 1px 2px 0 rgba(41, 37, 34, 0.04);
--shadow-card:   0 2px 8px -2px rgba(41, 37, 34, 0.05), 0 1px 4px -1px rgba(41, 37, 34, 0.03);
--shadow-hover:  0 8px 24px -4px rgba(41, 37, 34, 0.08), 0 2px 6px -2px rgba(41, 37, 34, 0.04);
--shadow-modal:  0 20px 48px -8px rgba(41, 37, 34, 0.16), 0 4px 12px -2px rgba(41, 37, 34, 0.06);
```

---

## 7. Component Usage Examples

### 7.1 Buttons (`Button`)

```tsx
import { Button } from "@/components/ui/button"

// 1. Default (Charcoal Solid)
<Button variant="default">Add to Bag</Button>

// 2. Signature Muted Gold
<Button variant="gold">Proceed to Checkout</Button>

// 3. Secondary Tinted
<Button variant="secondary">View Collection</Button>

// 4. Champagne Outline
<Button variant="outline">Learn More</Button>

// 5. Dark Brown Heritage
<Button variant="darkBrown">Artisan Story</Button>

// 6. Ghost Action
<Button variant="ghost">Cancel</Button>

// 7. Destructive (Muted Crimson)
<Button variant="destructive">Remove Item</Button>

// 8. Sizes
<Button size="sm">Quick View</Button>
<Button size="default">Standard Action</Button>
<Button size="lg">Express Checkout</Button>
<Button size="icon" aria-label="Wishlist"><Heart className="w-4 h-4" /></Button>
```

---

### 7.2 Form Inputs (`Input`, `Textarea`, `Label`)

```tsx
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Text Input
<div>
  <Label required>Email Address</Label>
  <Input type="email" placeholder="patron@domain.com" />
</div>

// Multiline Textarea (Gift Note)
<div>
  <Label>Handwritten Gift Message</Label>
  <Textarea placeholder="Write a warm bespoke message to accompany your gift..." />
</div>
```

---

### 7.3 Cards (`Card`, `CardHeader`, `CardTitle`, etc.)

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

<Card>
  <CardHeader>
    <CardTitle>Bespoke Packaging</CardTitle>
    <CardDescription>
      Every order is hand-inspected and enclosed in our signature keepsake velvet box.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-dark-brown/80 font-light">
      Includes an authenticity certificate and personalized greeting envelope.
    </p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">Add Packaging (₹149)</Button>
  </CardFooter>
</Card>
```

---

### 7.4 Product Card (`ProductCardUI`)

```tsx
import { ProductCardUI } from "@/components/ui/product-card"

<ProductCardUI
  id="prod_01"
  title="Royal Heritage Kundan Choker Necklace"
  slug="royal-heritage-kundan-choker"
  price={2499}
  compareAtPrice={3499}
  primaryImage="/images/products/kundan-choker-1.jpg"
  secondaryImage="/images/products/kundan-choker-2.jpg"
  categoryName="Artificial Jewellery"
  rating={4.9}
  reviewCount={38}
  isWishlisted={false}
  badgeText="Best Seller"
  onWishlistToggle={(id) => console.log("Wishlisted:", id)}
  onQuickView={(id) => console.log("Quick view:", id)}
  onAddToCart={(id) => console.log("Added:", id)}
/>
```

---

### 7.5 Navigation & Breadcrumbs (`Breadcrumb`)

```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Boutique</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/jewellery">Artificial Jewellery</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Kundan Necklaces</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

### 7.6 Toast Notifications (`toast`, `Toaster`)

The application root is configured with `<ToastProvider>`. Use the singleton anywhere:

```tsx
import { toast } from "@/components/ui/toast"

// Cart added
toast.cart("Added to Bag", "Royal Heritage Kundan Choker has been added to your bag.")

// Success
toast.success("Profile Updated", "Your bespoke delivery address has been saved.")

// Error
toast.error("Invalid Code", "The coupon code entered is invalid or has expired.")

// Info
toast.info("Free Shipping Unlocked", "You are eligible for complimentary express delivery.")
```

---

### 7.7 Empty States (`EmptyState`)

```tsx
import { EmptyState } from "@/components/ui/empty-state"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

<EmptyState
  icon={Heart}
  title="Your Wishlist is Empty"
  description="Save your favorite handcrafted treasures here to review or purchase anytime."
  action={
    <Button asChild variant="default">
      <Link href="/products">Discover Treasures</Link>
    </Button>
  }
/>
```

---

### 7.8 Error States (`ErrorState`)

```tsx
import { ErrorState } from "@/components/ui/error-state"

// Full Page / Container Error
<ErrorState
  errorCode="404"
  title="Treasure Not Found"
  message="The handcrafted item you are searching for might have retired or moved to another collection."
  onRetry={() => window.location.reload()}
  onBack={() => window.history.back()}
/>

// Inline Validation Error Banner
<ErrorState
  variant="banner"
  title="Checkout Error"
  message="Your card was declined by your bank. Please try another card or select Cash on Delivery."
  onRetry={() => retryPayment()}
/>
```

---

### 7.9 Loading Skeletons (`Skeleton`, `SkeletonProductCard`)

```tsx
import { Skeleton, SkeletonProductCard } from "@/components/ui/skeleton"

// Product Grid Skeleton
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {Array.from({ length: 4 }).map((_, i) => (
    <SkeletonProductCard key={i} />
  ))}
</div>
```

---

## 8. Responsive Breakpoints

TiniWish follows mobile-first design with high-density touch target guidelines:

| Breakpoint | Width | Typical Device | Layout Characteristics |
| :--- | :--- | :--- | :--- |
| **Base** | `< 640px` | iPhone / Android | Single column or 2-column compact grid, drawer filters, bottom stickies |
| **`sm`** | `640px` | Large Phones / Phablets | 2-column product grid, compact modals |
| **`md`** | `768px` | iPad / Tablets | 3-column product grid, top secondary navigation bar |
| **`lg`** | `1024px` | Laptop / Desktop | 4-column product grid, persistent filter sidebar, hover zoom PDP |
| **`xl`** | `1280px` | Wide Desktop | Maximum reading container `1200px` - `1280px`, spacious padding |
| **`2xl`** | `1536px` | Ultra-wide Screens | Centered max-width canvas preventing overstretched layouts |

---

## 9. Accessibility & Contrast Verification

- **Charcoal (`#292522`) on Primary Background (`#F7F3ED`)**: Contrast Ratio **`14.2:1`** (Exceeds WCAG AAA requirement of `7:1`).
- **Dark Brown (`#514238`) on Primary Background (`#F7F3ED`)**: Contrast Ratio **`8.6:1`** (Exceeds WCAG AAA).
- **Muted Gold (`#AE8958`) on Charcoal (`#292522`)**: Contrast Ratio **`4.8:1`** (Passes WCAG AA for headings & icons).
- **Touch Targets**: All interactive buttons, wishlist toggles, and drawer triggers enforce a minimum bounding box of **`44px × 44px`** for mobile accessibility.
- **Motion Reduction**: All transitions respect `prefers-reduced-motion: reduce`.

