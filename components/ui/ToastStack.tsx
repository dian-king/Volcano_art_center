"use client"
import { useToastStore } from "@/store/toast-store"
import { X } from "lucide-react"

export function ToastStack() {
  const { toasts, removeToast } = useToastStore()
  if (!toasts.length) return null
  return (
    <div className="toast-stack" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast__message">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="toast__close"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}