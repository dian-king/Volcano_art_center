"use client"
import { useState } from "react"
import { changePassword } from "@/actions/profile"
import { useToastStore } from "@/store/toast-store"
import { Eye, EyeOff } from "lucide-react"

const inp: React.CSSProperties = {
  height: "44px", padding: "0 var(--space-4)", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)", background: "var(--surface-base)",
  color: "var(--text-primary)", fontSize: "var(--text-small)",
  fontFamily: "var(--font-ui)", width: "100%",
}
const lbl: React.CSSProperties = {
  fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)",
  marginBottom: "var(--space-1)", display: "block",
}

function PwField({ name, label, show, onToggle }: { name: string; label: string; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position: "relative" }}>
        <input name={name} type={show ? "text" : "password"} required style={{ ...inp, paddingRight: "44px" }} />
        <button type="button" onClick={onToggle} style={{ position: "absolute", right: 0, top: 0, height: "44px", width: "44px", display: "grid", placeItems: "center", border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

export function ChangePasswordForm() {
  const { addToast } = useToastStore()
  const [pending, setPending] = useState(false)
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const result = await changePassword(new FormData(e.currentTarget))
    setPending(false)
    if (result?.error) { addToast(result.error, "error"); return }
    addToast("Password changed", "success");
    (e.target as HTMLFormElement).reset()
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: "420px", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <PwField name="currentPassword" label="Current password" show={show.current} onToggle={() => setShow(s => ({ ...s, current: !s.current }))} />
      <PwField name="newPassword" label="New password" show={show.next} onToggle={() => setShow(s => ({ ...s, next: !s.next }))} />
      <PwField name="confirmPassword" label="Confirm new password" show={show.confirm} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))} />
      <div>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Saving…" : "Change Password"}
        </button>
      </div>
    </form>
  )
}
