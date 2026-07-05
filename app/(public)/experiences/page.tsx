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

export default async function ExperiencesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const where: Record<string, unknown> = { status: "PUBLISHED" }
  if (params.category) where.category = { slug: params.category }

  const [rawExperiences, categories] = await Promise.all([
    db.experience.findMany({ where, orderBy: { featured: "desc" }, include: { category: true } }),
    db.experienceCategory.findMany({ orderBy: { name: "asc" } }),
  ])
  const experiences = rawExperiences.map(e => ({ ...e, durationHours: e.durationHours ? Number(e.durationHours) : null, pricePerPerson: e.pricePerPerson ? Number(e.pricePerPerson) : null, groupPrice: e.groupPrice ? Number(e.groupPrice) : null }))
  const TYPES = [{ value: "", label: "All" }, ...categories.map(c => ({ value: c.slug, label: c.name }))]

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ position: "relative", background: "var(--green-deep)", color: "#fff", padding: "var(--space-10) 0 var(--space-8)", overflow: "hidden" }}>
        <img src="/images/WhatsApp Image 2026-06-30 at 8.52.02 PM.jpeg" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.38 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>Rwanda Awaits</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 700, marginTop: "var(--space-2)", color: "#fff" }}>
            Experiences
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)", maxWidth: "52ch" }}>
            Immersive encounters with Rwanda&apos;s culture, communities, and nature
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {/* Type filter pills */}
        <nav aria-label="Experience types" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-7)" }}>
          {TYPES.map((t) => {
            const active = (params.category ?? "") === t.value
            return (
              <Link
                key={t.value}
                href={t.value ? `/experiences?category=${t.value}` : "/experiences"}
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