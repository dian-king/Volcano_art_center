"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { setOrderStatusAction, setDonationStatusAction } from "@/actions/admin-overrides"

export function StatusOverrideControl({
  kind, id, current, options,
}: {
  kind: "order" | "donation"
  id: string
  current: string
  options: string[]
}) {
  const router = useRouter()
  const [value, setValue] = useState(current)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function apply() {
    if (value === current) return
    if (!confirm(`Change status to ${value}? This may adjust campaign totals or customer-facing records.`)) return
    setMsg(null)
    startTransition(async () => {
      const action = kind === "order" ? setOrderStatusAction : setDonationStatusAction
      const result = await action(id, value)
      if (result?.error) setMsg({ ok: false, text: result.error })
      else { setMsg({ ok: true, text: "Updated" }); router.refresh() }
    })
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", justifyContent: "flex-end" }}>
      <select className="select" value={value} onChange={(e) => setValue(e.target.value)} style={{ height: 34, fontSize: "var(--text-caption)", padding: "0 8px" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <button type="button" className="btn btn--ghost btn--sm" onClick={apply} disabled={pending || value === current}>
        {pending ? "…" : "Apply"}
      </button>
      {msg && <span style={{ fontSize: "var(--text-caption)", color: msg.ok ? "var(--green)" : "var(--color-error)" }}>{msg.text}</span>}
    </div>
  )
}
