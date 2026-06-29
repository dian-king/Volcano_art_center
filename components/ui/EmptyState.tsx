import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-panel">
      <Icon size={44} aria-hidden="true" style={{ color: "var(--text-muted)", opacity: 0.45 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-body)", color: "var(--text-primary)" }}>{title}</h3>
        {description && <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)", maxWidth: "38ch" }}>{description}</p>}
      </div>
      {action && <Link href={action.href} className="btn btn--ghost btn--sm">{action.label}</Link>}
    </div>
  )
}
