import { db } from "@/lib/db"
import { EmptyState } from "@/components/ui/EmptyState"
import Link from "next/link"
import { AuthGuardButton } from "@/components/public/AuthGuardButton"
import Image from "next/image"
import { Users } from "lucide-react"
import type { Metadata } from "next"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Talent Programme",
  description: "Meet the talented artists supported by the Volcano Arts Center talent programme.",
}

const AREA_LABEL: Record<string, string> = {
  TRADITIONAL_DANCE: "Traditional Dance",
  VISUAL_ARTS: "Visual Arts",
  MUSIC: "Music",
  SCULPTURE: "Sculpture",
  TEXTILE: "Textile",
  PHOTOGRAPHY: "Photography",
  THEATRE: "Theatre",
}

export default async function TalentPage() {
  const profiles = await db.talentProfile.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ position: "relative", background: "var(--green-deep)", color: "#fff", padding: "var(--space-10) 0 var(--space-8)", overflow: "hidden" }}>
        <img src="/images/WhatsApp Image 2026-06-30 at 8.51.29 PM (1).jpeg" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.38 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>VAC Programme</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 700, marginTop: "var(--space-2)", color: "#fff" }}>
            Talent Programme
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)", maxWidth: "52ch" }}>
            Nurturing the next generation of Rwandan artists and cultural storytellers
          </p>
        </div>
      </div>

      {/* Artist grid */}
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {profiles.length === 0 ? (
          <EmptyState icon={Users} title="Talent profiles coming soon" description="Our programme is growing — check back soon." />
        ) : (
          <div className="talent-grid">
            {profiles.map((p) => (
              <Link key={p.id} href={`/talent/${p.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }} className="card card--interactive">
                {/* Avatar / image */}
                <div className="media media--4x3" style={{ position: "relative" }}>
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.displayName} fill sizes="33vw" style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "var(--green-tint)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--green-hover)" }}>
                      {p.displayName.charAt(0)}
                    </div>
                  )}
                  {p.talentArea && (
                    <span className="chip chip--accent" style={{ position: "absolute", bottom: "var(--space-3)", left: "var(--space-3)", zIndex: 2 }}>
                      {AREA_LABEL[p.talentArea] ?? p.talentArea}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
                  <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-body)", color: "var(--text-primary)" }}>
                    {p.displayName}
                  </h3>
                  {p.bio && (
                    <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.bio}
                    </p>
                  )}
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--green)", fontFamily: "var(--font-ui)", fontWeight: 600, marginTop: "auto", paddingTop: "var(--space-2)" }}>
                    View profile →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA band */}
      <div className="cta-band">
        <div className="container">
          <div className="cta-band__inner">
            <div>
              <h2>Interested in Joining?</h2>
              <p className="lead">Applications for the VAC Talent Programme open quarterly. We support emerging artists with mentorship, studio space, and exhibition opportunities.</p>
            </div>
            <div className="cta-band__actions">
              <AuthGuardButton href="/talent/apply" className="btn btn--ghost-invert">Apply to Programme</AuthGuardButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
