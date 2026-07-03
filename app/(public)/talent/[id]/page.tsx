import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await db.talentProfile.findUnique({ where: { id } })
  if (!p) return {}
  return { title: p.displayName, description: p.bio ?? `${p.displayName} — VAC Talent Programme` }
}

const AREA_LABEL: Record<string, string> = {
  TRADITIONAL_DANCE: "Traditional Dance", STORYTELLING: "Storytelling",
  CULTURAL_PERFORMANCE: "Cultural Performance", MUSIC: "Music",
  VISUAL_ARTS: "Visual Arts", CRAFTS: "Crafts", OTHER: "Other",
}
const CAT_LABEL: Record<string, string> = {
  YOUTH: "Youth", SINGLE_MOTHER: "Single Mother", PERSON_WITH_DISABILITY: "Person with Disability",
  ELDERLY: "Elderly Artist", PROFESSIONAL_ARTIST: "Professional Artist", COMMUNITY_MEMBER: "Community Member",
}

export default async function TalentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await db.talentProfile.findUnique({
    where: { id, published: true },
    include: { user: { select: { email: true } } },
  })
  if (!profile) notFound()

  const portfolio = (profile.portfolioItems as string[] | null) ?? []

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Hero */}
      <div style={{ background: "var(--green-deep)", padding: "var(--space-9) 0 var(--space-8)" }}>
        <div className="container">
          <Link href="/talent" style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
            ← Talent Directory
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
            {/* Avatar */}
            <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--green)", position: "relative", background: "var(--green-tint)", flexShrink: 0 }}>
              {profile.imageUrl
                ? <Image src={profile.imageUrl} alt={profile.displayName} fill style={{ objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--green)" }}>{profile.displayName.charAt(0)}</div>
              }
            </div>
            <div>
              <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
                <span className="chip chip--accent">{AREA_LABEL[profile.talentArea] ?? profile.talentArea}</span>
                <span className="chip chip--neutral" style={{ color: "rgba(255,255,255,0.7)" }}>{CAT_LABEL[profile.category] ?? profile.category}</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
                {profile.displayName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container checkout-layout" style={{ paddingBlock: "var(--space-8)", gap: "var(--space-9)" }}>

        {/* Left: bio + portfolio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
          {profile.bio && (
            <div>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-4)" }}>About</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {profile.bio}
              </p>
            </div>
          )}

          {portfolio.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-5)" }}>Portfolio</h2>
              <div className="talent-grid">
                {portfolio.map((url, i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--green-tint)" }}>
                    <Image src={url} alt={`${profile.displayName} portfolio ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="25vw" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: contact / apply card */}
        <div style={{ position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
          <div className="card" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)" }}>Commission or Book</h3>
            <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Interested in working with {profile.displayName.split(" ")[0]}? Get in touch with the VAC team.
            </p>
            <Link
              href={`/contact?subject=Commission: ${encodeURIComponent(profile.displayName)}`}
              className="btn btn--primary"
              style={{ textAlign: "center", width: "100%", justifyContent: "center" }}
            >
              Get in Touch
            </Link>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                Part of the <strong style={{ color: "var(--text-primary)" }}>VAC Talent Programme</strong>
              </p>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                {AREA_LABEL[profile.talentArea]} · {CAT_LABEL[profile.category]}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <Link href="/talent/apply" style={{ fontSize: "var(--text-small)", color: "var(--green)", fontFamily: "var(--font-ui)" }}>
              Apply to the programme →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
