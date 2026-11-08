import * as React from "react"
import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-secondary-bg/80 relative overflow-hidden",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-champagne/30 after:to-transparent",
        className
      )}
      {...props}
    />
  )
}

function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* 3:4 aspect ratio image container */}
      <Skeleton className="w-full aspect-[3/4] rounded-lg" />
      {/* Category tag */}
      <Skeleton className="h-3 w-1/3 rounded-xs" />
      {/* Title */}
      <Skeleton className="h-4 w-4/5 rounded-xs" />
      {/* Price strip */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-4 w-16 rounded-xs" />
        <Skeleton className="h-3 w-12 rounded-xs" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonProductCard }
