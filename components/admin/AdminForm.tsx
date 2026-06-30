// Shared field primitives for admin forms
export const F = {
  wrap: { display: "flex", flexDirection: "column" as const, gap: "var(--space-1)" },
  label: { fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--text-muted)", fontFamily: "var(--font-ui)" } as React.CSSProperties,
  inp: { height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%" } as React.CSSProperties,
  sel: { height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%", cursor: "pointer" } as React.CSSProperties,
  ta: { padding: "var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%", resize: "vertical" as const, minHeight: "120px" } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" } as React.CSSProperties,
  actions: { display: "flex", gap: "var(--space-3)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)", marginTop: "var(--space-2)" } as React.CSSProperties,
  check: (name: string, label: string, checked: boolean) => (
    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-small)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
      <input type="checkbox" name={name} defaultChecked={checked} style={{ accentColor: "var(--green)", width: 16, height: 16 }} />
      {label}
    </label>
  ),
}

export const statusBadge = (status: string, map: Record<string, string>) => (
  <span style={{ color: map[status] ?? "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-small)" }}>{status}</span>
)

export const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "var(--green)", DRAFT: "var(--text-muted)", SOLD: "#e53e3e",
  ACTIVE: "var(--green)", COMPLETED: "var(--green)", PAUSED: "orange",
  PENDING: "#d97706", CONFIRMED: "var(--green)", CANCELLED: "#e53e3e",
  PROCESSING: "#2563eb", SHIPPED: "#2563eb", DELIVERED: "var(--green)", REFUNDED: "#7c3aed",
  APPROVED: "var(--green)", REJECTED: "#e53e3e", AWAITING_INFO: "orange", ARCHIVED: "var(--text-muted)",
  NEW: "#2563eb", IN_PROGRESS: "orange", CLOSED: "var(--text-muted)",
  AVAILABLE: "var(--green)", LIMITED: "orange", FULLY_BOOKED: "#e53e3e", REQUEST_ONLY: "#7c3aed", BLACKOUT: "var(--text-muted)",
}

// Table head/cell styles
export const TH: React.CSSProperties = { padding: "var(--space-3) var(--space-4)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)", textAlign: "left", borderBottom: "2px solid var(--border-subtle)", whiteSpace: "nowrap" }
export const TD: React.CSSProperties = { padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-small)", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)", verticalAlign: "middle" }
