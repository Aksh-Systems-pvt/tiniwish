"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, Info, ShoppingBag, X } from "lucide-react"
import { cn } from "cn"

export type ToastType = "success" | "error" | "info" | "cart"

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// Global singleton listener for calling toast outside React tree
type ToastListener = (toast: Omit<ToastMessage, "id">) => void
let globalListener: ToastListener | null = null
const pendingToasts: Omit<ToastMessage, "id">[] = []

function dispatchToast(msg: Omit<ToastMessage, "id">) {
  setTimeout(() => {
    if (globalListener) {
      globalListener(msg)
    } else {
      pendingToasts.push(msg)
    }
  }, 0)
}

export const toast = {
  success: (title: string, description?: string) => {
    dispatchToast({ title, description, type: "success" })
  },
  error: (title: string, description?: string) => {
    dispatchToast({ title, description, type: "error" })
  },
  info: (title: string, description?: string) => {
    dispatchToast({ title, description, type: "info" })
  },
  cart: (title: string, description?: string) => {
    dispatchToast({ title, description, type: "cart" })
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])
  const isMountedRef = React.useRef(false)
  const timerIdsRef = React.useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = React.useCallback(
    (newToast: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const toastWithId: ToastMessage = {
        ...newToast,
        id,
        duration: newToast.duration || 4000,
      }

      // Schedule asynchronously on next tick to prevent any React render-phase update conflicts
      const tickId = setTimeout(() => {
        timerIdsRef.current.delete(tickId)
        if (!isMountedRef.current) return

        setToasts((prev) => [...prev, toastWithId])

        if (toastWithId.duration && toastWithId.duration > 0) {
          const autoDismissId = setTimeout(() => {
            timerIdsRef.current.delete(autoDismissId)
            if (isMountedRef.current) {
              removeToast(id)
            }
          }, toastWithId.duration)
          timerIdsRef.current.add(autoDismissId)
        }
      }, 0)
      timerIdsRef.current.add(tickId)
    },
    [removeToast]
  )

  React.useEffect(() => {
    isMountedRef.current = true
    globalListener = addToast

    // Flush any pending toasts that were dispatched before mounting
    if (pendingToasts.length > 0) {
      const queued = [...pendingToasts]
      pendingToasts.length = 0
      queued.forEach((item) => addToast(item))
    }

    const activeTimers = timerIdsRef.current
    return () => {
      isMountedRef.current = false
      globalListener = null
      activeTimers.forEach((tid) => clearTimeout(tid))
      activeTimers.clear()
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function Toaster() {
  const context = React.useContext(ToastContext)
  if (!context) return null
  const { toasts, removeToast } = context

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4 sm:p-0"
    >
      {toasts.map((t) => {
        const getIcon = () => {
          switch (t.type) {
            case "success":
              return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            case "error":
              return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            case "cart":
              return <ShoppingBag className="w-4 h-4 text-muted-gold shrink-0 mt-0.5" />
            case "info":
            default:
              return <Info className="w-4 h-4 text-muted-gold shrink-0 mt-0.5" />
          }
        }

        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-md bg-white border border-champagne text-charcoal shadow-modal transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
            )}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-serif text-sm font-medium leading-snug">{t.title}</div>
              {t.description && (
                <div className="font-sans text-xs text-dark-brown/70 mt-0.5 leading-relaxed">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="text-dark-brown/40 hover:text-charcoal transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

