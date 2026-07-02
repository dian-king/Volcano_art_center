"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { approveDonationAction } from "@/actions/donations"

export function ApproveDonationButton({ donationId, donorLabel }: { donationId: string; donorLabel: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onClick() {
    if (!confirm(`Approve this donation from ${donorLabel}? This confirms the payment arrived and emails the donor a receipt.`)) return
    setError(null)
    startTransition(async () => {
      const result = await approveDonationAction(donationId)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
      <button type="button" className="btn btn--primary btn--sm" onClick={onClick} disabled={pending}>
        {pending ? "Approving…" : "Approve"}
      </button>
      {error && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}>{error}</span>}
    </div>
  )
}
