"use client"
import { useState } from "react"

interface Tab { key: string; label: string }
const TABS: Tab[] = [
  { key: "overview", label: "Overview" },
  { key: "inclusions", label: "What's Included" },
  { key: "reviews", label: "Reviews" },
]

export function ExperienceTabs({ overview, inclusions, reviews }: {
  overview: React.ReactNode
  inclusions: React.ReactNode
  reviews: React.ReactNode
}) {
  const [active, setActive] = useState("overview")
  const content = { overview, inclusions, reviews }

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--space-1)", borderBottom: "1px solid var(--border-subtle)", marginBottom: "var(--space-6)" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "var(--space-3) var(--space-4)", border: "none", background: "transparent",
              fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)",
              color: active === t.key ? "var(--green)" : "var(--text-muted)",
              borderBottom: active === t.key ? "2px solid var(--green)" : "2px solid transparent",
              cursor: "pointer", marginBottom: "-1px"
            }}
          >{t.label}</button>
        ))}
      </div>
      {content[active as keyof typeof content]}
    </div>
  )
}
