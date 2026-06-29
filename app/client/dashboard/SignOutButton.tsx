"use client"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)",
        border: "none", background: "transparent", cursor: "pointer",
        color: "var(--text-muted)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)",
        textAlign: "left",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,0,0,0.08)"; e.currentTarget.style.color = "#e53e3e" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)" }}
    >
      <LogOut size={15} />
      Sign Out
    </button>
  )
}
