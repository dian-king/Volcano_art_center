"use client"
import { useState } from "react"
import { markNotificationsRead } from "@/actions/profile"
import { useToastStore } from "@/store/toast-store"
import { Bell } from "lucide-react"

interface Notif { id: string; title: string; body: string; read: boolean; ctaUrl: string | null; createdAt: Date }

export function NotificationsPanel({ notifications }: { notifications: Notif[] }) {
  const { addToast } = useToastStore()
  const [items, setItems] = useState(notifications)
  const unread = items.filter(n => !n.read)

  async function markAll() {
    const ids = unread.map(n => n.id)
    if (!ids.length) return
    await markNotificationsRead(ids)
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    addToast("All marked as read", "success")
  }

  async function markOne(id: string) {
    await markNotificationsRead([id])
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  if (items.length === 0) return (
    <div style={{ textAlign: "center", padding: "var(--space-10) 0", color: "var(--text-muted)" }}>
      <Bell size={40} style={{ margin: "0 auto var(--space-3)", opacity: 0.3 }} />
      <p style={{ fontFamily: "var(--font-ui)" }}>No notifications yet</p>
    </div>
  )

  return (
    <div>
      {unread.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }}>
          <button className="btn btn--ghost btn--sm" onClick={markAll}>Mark all as read</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {items.map(n => (
          <div key={n.id} style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: n.read ? "transparent" : "var(--green-tint)", display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : "var(--green)", flexShrink: 0, marginTop: 6 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", marginBottom: "var(--space-1)" }}>{n.title}</p>
              <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>{n.body}</p>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
              {n.ctaUrl && <a href={n.ctaUrl} className="btn btn--ghost btn--sm">View</a>}
              {!n.read && <button className="btn btn--ghost btn--sm" onClick={() => markOne(n.id)}>✓</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
