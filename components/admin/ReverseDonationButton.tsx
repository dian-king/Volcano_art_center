"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { reverseDonationAction } from "@/actions/donations"

export function ReverseDonationButton({ donationId, donorLabel }: { donationId: string; donorLabel: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onClick() {
    if (!confirm(`Reverse this donation from ${donorLabel}? It will be marked cancelled and subtracted from the campaign total.`)) return
    setError(null)
    startTransition(async () => {
      const result = await reverseDonationAction(donationId)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
      <button type="button" className="btn btn--ghost btn--sm" onClick={onClick} disabled={pending}>
        {pending ? "Reversing…" : "Reverse"}
      </button>
      {error && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}>{error}</span>}
    </div>
  )
}
