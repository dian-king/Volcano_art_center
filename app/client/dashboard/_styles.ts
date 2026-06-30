export const card: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-6)",
}

export const th: React.CSSProperties = {
  padding: "var(--space-3) var(--space-4)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  fontFamily: "var(--font-ui)",
  textAlign: "left",
  borderBottom: "2px solid var(--border-subtle)",
}

export const td: React.CSSProperties = {
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--text-small)",
  color: "var(--text-secondary)",
  borderBottom: "1px solid var(--border-subtle)",
}

export const statusColor: Record<string, string> = {
  PENDING: "var(--text-muted)",
  PROCESSING: "#d97706",
  SHIPPED: "#2563eb",
  DELIVERED: "var(--green)",
  CANCELLED: "#e53e3e",
  REFUNDED: "#7c3aed",
  CONFIRMED: "var(--green)",
  COMPLETED: "var(--green)",
  REJECTED: "#e53e3e",
}
