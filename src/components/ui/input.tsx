import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-champagne bg-white px-3.5 py-2 text-sm text-charcoal font-sans transition-all duration-200 outline-none placeholder:text-dark-brown/40 placeholder:font-light focus-visible:border-muted-gold focus-visible:ring-2 focus-visible:ring-muted-gold/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary-bg/50 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
