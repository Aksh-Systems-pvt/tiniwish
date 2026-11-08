import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-xs border px-2 py-0.5 text-[10px] uppercase font-sans font-medium tracking-wider whitespace-nowrap transition-colors select-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal text-primary-bg border-charcoal",
        gold:
          "bg-muted-gold text-white border-muted-gold",
        champagne:
          "bg-champagne text-dark-brown border-champagne",
        secondary:
          "bg-secondary-bg text-dark-brown border-champagne/60",
        outline:
          "border-champagne text-dark-brown bg-transparent",
        pill:
          "rounded-full bg-champagne-light text-dark-brown border-champagne/70 px-2.5",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
