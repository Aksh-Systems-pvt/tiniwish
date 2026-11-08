import * as React from "react"
import { cn } from "cn"

export interface LabelProps extends React.ComponentProps<"label"> {
  required?: boolean
}

function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block font-sans text-xs font-medium uppercase tracking-wider text-dark-brown mb-1.5 select-none",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-muted-gold ml-1 font-semibold">*</span>}
    </label>
  )
}

export { Label }

