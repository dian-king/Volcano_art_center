import Link from "next/link"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-6) var(--space-4)",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-7)", textDecoration: "none" }}>
        <img src="/images/logo.png" alt="Volcano Arts Center Inc Rwanda" style={{ height: 48, width: "auto" }} />
      </Link>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "var(--surface-raised)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        padding: "clamp(var(--space-6), 5vw, var(--space-8))",
      }}>
        {children}
      </div>

      <p style={{ marginTop: "var(--space-5)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>
        <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>← Back to Volcano Arts Center</Link>
      </p>
    </div>
  )
}