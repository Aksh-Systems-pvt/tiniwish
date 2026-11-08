import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[100px] w-full rounded-md border border-champagne bg-white px-3.5 py-2.5 text-sm text-charcoal font-sans transition-all duration-200 outline-none placeholder:text-dark-brown/40 placeholder:font-light focus-visible:border-muted-gold focus-visible:ring-2 focus-visible:ring-muted-gold/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary-bg/50 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

