"use client"
import { useRouter, useSearchParams } from "next/navigation"

export function StockFilter({ checked }: { checked: boolean }) {
  const router = useRouter()
  const sp = useSearchParams()
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-small)", color: "var(--text-secondary)", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString())
          if (e.target.checked) p.set("inStock", "true")
          else p.delete("inStock")
          p.delete("page")
          router.push("/art-store?" + p.toString())
        }}
        style={{ accentColor: "var(--green)" }}
      />
      In stock only
    </label>
  )
}
