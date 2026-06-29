import { db } from "@/lib/db"
import { ExperienceCard } from "@/components/public/ExperienceCard"
import { EmptyState } from "@/components/ui/EmptyState"
import Link from "next/link"
import { Map } from "lucide-react"
import type { Metadata } from "next"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Experiences",
  description: "Cultural tours, village visits, conservation walks and custom experiences in Rwanda.",
}

const TYPES = [
  { value: "", label: "All" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "VILLAGE", label: "Village" },
  { value: "CONSERVATION", label: "Conservation" },
  { value: "CUSTOM", label: "Custom" },
]

export default async function ExperiencesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const where: Record<string, unknown> = { status: "PUBLISHED" }
  if (params.type) where.experienceType = params.type

  const rawExperiences = await db.experience.findMany({ where, orderBy: { featured: "desc" } })
  const experiences = rawExperiences.map(e => ({ ...e, durationHours: e.durationHours ? Number(e.durationHours) : null, pricePerPerson: e.pricePerPerson ? Number(e.pricePerPerson) : null, groupPrice: e.groupPrice ? Number(e.groupPrice) : null }))

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ background: "var(--green-deep)", color: "#fff", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Rwanda Awaits</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            Experiences
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            Immersive encounters with Rwanda's culture, communities, and nature
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {/* Type filter pills */}
        <nav aria-label="Experience types" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-7)" }}>
          {TYPES.map((t) => {
            const active = (params.type ?? "") === t.value
            return (
              <Link
                key={t.value}
                href={t.value ? `/experiences?type=${t.value}` : "/experiences"}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-pill)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 600,
                  fontSize: "var(--text-small)",
                  background: active ? "var(--green)" : "var(--surface-raised)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: "1px solid",
                  borderColor: active ? "var(--green)" : "var(--border-subtle)",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>

        {experiences.length === 0 ? (
          <EmptyState icon={Map} title="No experiences found" description="Try a different category." action={{ label: "View all", href: "/experiences" }} />
        ) : (
          <div className="exp-grid">
            {experiences.map((e) => <ExperienceCard key={e.id} experience={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}