import { db } from "@/lib/db"
import { DonationForm } from "@/components/forms/DonationForm"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await db.conservationCampaign.findUnique({ where: { slug } })
  if (!c) return {}
  return { title: c.name, description: c.description ?? c.name }
}

export const revalidate = 3600

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaign = await db.conservationCampaign.findUnique({ where: { slug } })
  if (!campaign || campaign.status === "ARCHIVED") notFound()

  const raised = Number(campaign.raisedAmount)
  const goal = Number(campaign.goalAmount ?? 0)
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: "clamp(260px, 40vh, 420px)", background: "var(--green-deep)", overflow: "hidden" }}>
        {campaign.imageUrl ? (
          <Image src={campaign.imageUrl} alt={campaign.name} fill style={{ objectFit: "cover", opacity: 0.6 }} sizes="100vw" />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--green-deep) 0%, #1B4332 100%)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
        <div className="container" style={{ position: "absolute", bottom: "var(--space-7)", left: "50%", transform: "translateX(-50%)", width: "100%" }}>
          <span className="chip chip--accent" style={{ marginBottom: "var(--space-3)" }}>Conservation</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
            {campaign.name}
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: "var(--space-5)", paddingBottom: "var(--space-2)" }}>
        <nav style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", alignItems: "center" }}>
          <Link href="/conservation" style={{ color: "var(--text-muted)" }}>Conservation</Link>
          <span>›</span>
          <span style={{ color: "var(--text-primary)" }}>{campaign.name}</span>
        </nav>
      </div>

      <div className="container checkout-layout" style={{ paddingBlock: "var(--space-7)", gap: "var(--space-9)" }}>

        {/* Left: campaign details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

          {/* Funding progress */}
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-headline)", fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>
                  {pct}%
                </p>
                <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>funded</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-title)", fontWeight: 700, color: "var(--text-primary)" }}>
                  {raised.toLocaleString()} <span style={{ fontSize: "var(--text-small)", fontWeight: 400, color: "var(--text-muted)" }}>RWF</span>
                </p>
                <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>raised of {goal.toLocaleString()} RWF goal</p>
              </div>
            </div>
            <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: "12px" }}>
              <div className="progress__fill" style={{ width: `${pct}%` }} />
            </div>
            {campaign.donorCount > 0 && (
              <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{campaign.donorCount}</strong> donors so far
              </p>
            )}
          </div>

          {/* Description */}
          {campaign.description && (
            <div>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-3)" }}>About This Campaign</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {campaign.description}
              </p>
            </div>
          )}

          {/* Impact statement */}
          {campaign.impactStatement && (
            <div style={{ background: "var(--green-tint)", border: "1px solid var(--green)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontStyle: "italic", color: "var(--green-deep)", lineHeight: 1.4 }}>
                "{campaign.impactStatement}"
              </p>
            </div>
          )}
        </div>

        {/* Right: donation form */}
        <div style={{ position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
          <div className="card" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Support This Campaign</h3>
            <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Your contribution goes directly to conservation efforts on the ground.
            </p>
            <DonationForm campaigns={[{ id: campaign.id, name: campaign.name }]} />
          </div>
        </div>
      </div>
    </div>
  )
}
