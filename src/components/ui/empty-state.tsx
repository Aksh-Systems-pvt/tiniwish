import * as React from "react"
import Link from "next/link"
import { LucideIcon, Sparkles, ShoppingBag, Heart } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  title: string
  description?: string
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  action,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 rounded-lg border border-champagne/40 bg-white/60 backdrop-blur-xs max-w-md mx-auto my-8",
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-full bg-secondary-bg flex items-center justify-center text-muted-gold mb-5 border border-champagne/50">
        <Icon className="w-6 h-6 text-muted-gold" />
      </div>

      <h3 className="font-serif text-xl sm:text-2xl font-normal text-charcoal tracking-tight mb-2">
        {title}
      </h3>

      {description && (
        <p className="font-sans text-xs sm:text-sm text-dark-brown/70 font-light leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export function EmptyCart({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Your Shopping Bag is Empty"
      description="You haven't added any handcrafted treasures to your bag yet. Explore our curated collections."
      action={
        <Link href="/products">
          <Button onClick={onExplore} className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2.5 cursor-pointer">
            Discover Treasures
          </Button>
        </Link>
      }
    />
  )
}

export function EmptyWishlist({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="Your Wishlist is Empty"
      description="Save your favorite handcrafted jewellery, bespoke gifts, and home accents to admire later."
      action={
        <Link href="/products">
          <Button onClick={onExplore} className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2.5 cursor-pointer">
            Explore Collections
          </Button>
        </Link>
      }
    />
  )
}
