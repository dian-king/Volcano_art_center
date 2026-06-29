"use client"
import { useState, useRef, useEffect } from "react"
import { COUNTRIES, flagEmoji } from "@/lib/countries"

interface Props {
  value: string         // dial code e.g. "+250"
  onChange: (dialCode: string) => void
}

export function DialCodeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dialCode.includes(search)
      )
    : COUNTRIES

  const selected = COUNTRIES.find(c => c.dialCode === value) ?? COUNTRIES.find(c => c.code === "RW")!

  const triggerStyle: React.CSSProperties = {
    height: "44px", width: "130px", padding: "0 var(--space-3)",
    border: open ? "1px solid var(--green)" : "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)", background: "var(--surface-base)",
    color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    cursor: "pointer", gap: "var(--space-2)", flexShrink: 0,
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" style={triggerStyle} onClick={() => setOpen(v => !v)}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{flagEmoji(selected.code)}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)" }}>{value}</span>
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .15s", flexShrink: 0, color: "var(--text-muted)" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, width: "260px",
          background: "var(--surface-raised)", border: "1px solid var(--green)",
          borderRadius: "var(--radius-md)", zIndex: 9999, boxShadow: "var(--shadow-xl)", overflow: "hidden",
        }}>
          <div style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "1px solid var(--border-subtle)" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code…"
              style={{
                width: "100%", height: "36px", padding: "0 var(--space-3)",
                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                background: "var(--surface-base)", color: "var(--text-primary)",
                fontSize: "var(--text-small)", fontFamily: "var(--font-ui)",
              }}
            />
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.dialCode); setOpen(false); setSearch("") }}
                style={{
                  width: "100%", padding: "var(--space-2) var(--space-3)",
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  background: value === c.dialCode && selected.code === c.code ? "var(--green-tint)" : "transparent",
                  color: "var(--text-primary)", fontSize: "var(--text-small)",
                  fontFamily: "var(--font-ui)", cursor: "pointer", textAlign: "left", border: "none",
                }}
                onMouseEnter={e => { (e.currentTarget.style.background = "var(--surface-base)") }}
                onMouseLeave={e => { (e.currentTarget.style.background = "transparent") }}
              >
                <span style={{ fontSize: "1.3rem", lineHeight: 1, flexShrink: 0 }}>{flagEmoji(c.code)}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{c.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
