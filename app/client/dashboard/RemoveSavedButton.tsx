"use client"
import { useState } from "react"
import { removeSavedItem } from "@/actions/profile"
import { Trash2 } from "lucide-react"

export function RemoveSavedButton({ productId }: { productId: string }) {
  const [pending, setPending] = useState(false)
  return (
    <button
      onClick={async () => { setPending(true); await removeSavedItem(productId) }}
      disabled={pending}
      aria-label="Remove from saved"
      style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2 }}
    >
      <Trash2 size={13} />
    </button>
  )
}
