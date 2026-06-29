"use client"
import { useState, useRef, useEffect } from "react"
import { COUNTRIES, flagEmoji } from "@/lib/countries"

interface Props {
  value: string         // country name
  onChange: (name: string) => void
  placeholder?: string
}

export function CountrySelect({ value, onChange, placeholder = "— Select country —" }: Props) {
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
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES

  const selected = COUNTRIES.find(c => c.name === value)

  const dropStyle: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
    background: "var(--surface-raised)", border: "1px solid var(--green)",
    borderRadius: "var(--radius-md)", zIndex: 9999,
    boxShadow: "var(--shadow-xl)", overflow: "hidden",
  }

  const triggerStyle: React.CSSProperties = {
    height: "44px", width: "100%", padding: "0 var(--space-4)",
    border: open ? "1px solid var(--green)" : "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)", background: "var(--surface-base)",
    color: selected ? "var(--text-primary)" : "var(--text-muted)",
    fontSize: "var(--text-small)", fontFamily: "var(--font-ui)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    cursor: "pointer", gap: "var(--space-2)",
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" style={triggerStyle} onClick={() => setOpen(v => !v)}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {selected ? (
            <>
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{flagEmoji(selected.code)}</span>
              <span>{selected.name}</span>
            </>
          ) : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .15s", flexShrink: 0, color: "var(--text-muted)" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={dropStyle}>
          {/* Search */}
          <div style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "1px solid var(--border-subtle)" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              style={{
                width: "100%", height: "36px", padding: "0 var(--space-3)",
                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                background: "var(--surface-base)", color: "var(--text-primary)",
                fontSize: "var(--text-small)", fontFamily: "var(--font-ui)",
              }}
            />
          </div>

          {/* List */}
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-small)" }}>No results</div>
            ) : filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.name); setOpen(false); setSearch("") }}
                style={{
                  width: "100%", padding: "var(--space-2) var(--space-3)",
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  background: value === c.name ? "var(--green-tint)" : "transparent",
                  color: "var(--text-primary)", fontSize: "var(--text-small)",
                  fontFamily: "var(--font-ui)", cursor: "pointer", textAlign: "left",
                  border: "none",
                }}
                onMouseEnter={e => { if (value !== c.name) (e.currentTarget.style.background = "var(--surface-base)") }}
                onMouseLeave={e => { (e.currentTarget.style.background = value === c.name ? "var(--green-tint)" : "transparent") }}
              >
                <span style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}>{flagEmoji(c.code)}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
