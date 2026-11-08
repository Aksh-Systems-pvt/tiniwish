import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-sans font-medium tracking-wide whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal text-primary-bg hover:bg-dark-brown shadow-subtle active:translate-y-px border border-charcoal hover:border-dark-brown",
        gold:
          "bg-muted-gold text-white hover:bg-gold-hover shadow-subtle active:translate-y-px border border-muted-gold hover:border-gold-hover",
        primary:
          "bg-charcoal text-primary-bg hover:bg-dark-brown shadow-subtle active:translate-y-px border border-charcoal hover:border-dark-brown",
        secondary:
          "bg-secondary-bg text-charcoal hover:bg-champagne/60 border border-champagne/50 active:translate-y-px",
        outline:
          "border border-champagne bg-transparent text-charcoal hover:bg-secondary-bg hover:border-dark-brown/40 active:translate-y-px",
        darkBrown:
          "bg-dark-brown text-white hover:bg-charcoal shadow-subtle active:translate-y-px border border-dark-brown",
        ghost:
          "bg-transparent text-charcoal hover:bg-secondary-bg/80 active:translate-y-px",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-subtle active:translate-y-px border border-destructive",
        link:
          "text-muted-gold underline-offset-4 hover:underline hover:text-dark-brown p-0 h-auto font-normal",
      },
      size: {
        default: "h-10 px-5 text-sm rounded-md gap-2",
        xs: "h-7 px-2.5 text-xs rounded-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3.5 text-xs rounded-sm gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-7 text-base rounded-md gap-2.5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 rounded-md",
        "icon-sm": "size-8 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-md [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
