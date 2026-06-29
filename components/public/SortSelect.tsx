"use client"
import { useRouter, useSearchParams } from "next/navigation"

export function SortSelect({ value }: { value: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  return (
    <select
      value={value}
      onChange={(e) => {
        const p = new URLSearchParams(sp.toString())
        p.set("sort", e.target.value)
        p.delete("page")
        router.push("/art-store?" + p.toString())
      }}
      style={{ height: "36px", width: "auto", fontSize: "var(--text-small)", background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0 var(--space-3)", color: "var(--text-primary)", cursor: "pointer" }}
    >
      <option value="featured">Featured</option>
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low → High</option>
      <option value="price_desc">Price: High → Low</option>
    </select>
  )
}
