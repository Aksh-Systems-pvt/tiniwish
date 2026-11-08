import * as React from "react"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string
  message?: string
  errorCode?: string | number
  onRetry?: () => void
  onBack?: () => void
  action?: React.ReactNode
  variant?: "full" | "inline" | "banner"
}

export function ErrorState({
  title = "Something went amiss",
  message = "We were unable to complete your request. Please try again or reach out to our concierge.",
  errorCode,
  onRetry,
  onBack,
  action,
  variant = "full",
  className,
  ...props
}: ErrorStateProps) {
  if (variant === "banner") {
    return (
      <div
        role="alert"
        className={cn(
          "p-4 rounded-md bg-rose-50/80 border border-rose-200/80 text-rose-950 text-xs sm:text-sm flex items-start gap-3",
          className
        )}
        {...props}
      >
        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <strong className="font-medium mr-1.5">{title}:</strong>
          <span className="font-light text-rose-900">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs uppercase tracking-wider text-rose-800 hover:text-rose-950 font-medium underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div
        role="alert"
        className={cn(
          "p-3 rounded-md bg-secondary-bg/80 border border-champagne text-xs text-dark-brown flex items-center gap-2.5",
          className
        )}
        {...props}
      >
        <AlertCircle className="w-4 h-4 text-muted-gold shrink-0" />
        <span className="flex-1 font-light">{message}</span>
        {onRetry && (
          <Button onClick={onRetry} variant="ghost" size="xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 rounded-lg border border-champagne/40 bg-white/70 max-w-md mx-auto my-10 shadow-card",
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-700 mb-5 border border-rose-200">
        <AlertCircle className="w-6 h-6 text-rose-700" />
      </div>

      {errorCode && (
        <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-muted-gold mb-1">
          Error {errorCode}
        </span>
      )}

      <h3 className="font-serif text-xl sm:text-2xl font-normal text-charcoal tracking-tight mb-2">
        {title}
      </h3>

      <p className="font-sans text-xs sm:text-sm text-dark-brown/70 font-light leading-relaxed max-w-sm mb-6">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" size="default">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </Button>
        )}
        {onBack && (
          <Button onClick={onBack} variant="outline" size="default">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}

