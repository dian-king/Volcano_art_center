import type { ReactNode } from "react"

export interface LegalSection {
  heading: string
  body: ReactNode
}

export function LegalDocument({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: {
  eyebrow: string
  title: string
  lastUpdated: string
  intro: ReactNode
  sections: LegalSection[]
}) {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ background: "var(--green-deep)", padding: "var(--space-9) 0 var(--space-7)" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>{eyebrow}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            {title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-small)", marginTop: "var(--space-3)", fontFamily: "var(--font-ui)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ paddingBlock: "var(--space-8)", maxWidth: "760px" }}>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "var(--text-body)", marginBottom: "var(--space-7)" }}>
          {intro}
        </p>

        {sections.map((s, i) => (
          <section key={s.heading} style={{ marginBottom: "var(--space-7)" }}>
            <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>
              {i + 1}. {s.heading}
            </h2>
            <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "var(--text-body)" }}>
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
