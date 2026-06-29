"use client"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { deleteAccount } from "@/actions/profile"
import { useToastStore } from "@/store/toast-store"

export function DeleteAccountSection() {
  const { addToast } = useToastStore()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [typed, setTyped] = useState("")

  async function handleDelete() {
    setPending(true)
    const result = await deleteAccount()
    if (result?.error) { addToast(result.error, "error"); setPending(false); return }
    await signOut({ callbackUrl: "/" })
  }

  return (
    <>
      <div style={{ border: "1px solid #e53e3e33", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
        <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "#e53e3e", marginBottom: "var(--space-2)" }}>
          Delete Account
        </h3>
        <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginBottom: "var(--space-4)", maxWidth: "52ch" }}>
          Permanently deactivates your account. Your orders and booking history will be preserved for legal reasons but you will no longer be able to sign in.
        </p>
        <button
          className="btn btn--sm"
          onClick={() => setOpen(true)}
          style={{ background: "#e53e3e", color: "#fff", border: "none" }}
        >
          Delete my account
        </button>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "grid", placeItems: "center" }}>
          <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius-lg)", padding: "var(--space-7)", maxWidth: "420px", width: "90%", boxShadow: "var(--shadow-xl)" }}>
            <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Are you absolutely sure?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", marginBottom: "var(--space-5)" }}>
              This cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="Type DELETE"
              style={{ height: "44px", padding: "0 var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-base)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", width: "100%", marginBottom: "var(--space-5)" }}
            />
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button
                disabled={typed !== "DELETE" || pending}
                onClick={handleDelete}
                style={{ padding: "var(--space-2) var(--space-5)", borderRadius: "var(--radius-pill)", background: typed === "DELETE" ? "#e53e3e" : "var(--border-subtle)", color: typed === "DELETE" ? "#fff" : "var(--text-muted)", border: "none", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", cursor: typed === "DELETE" ? "pointer" : "not-allowed" }}
              >
                {pending ? "Deleting…" : "Yes, delete"}
              </button>
              <button className="btn btn--ghost" onClick={() => { setOpen(false); setTyped("") }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
