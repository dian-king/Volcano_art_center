import { db } from "@/lib/db"
import Link from "next/link"
import { DonationForm } from "@/components/forms/DonationForm"
import Image from "next/image"
import type { Metadata } from "next"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Conservation",
  description: "Support conservation campaigns protecting Rwanda'\''s natural heritage and communities.",
}

export default async function ConservationPage() {
  const campaigns = await db.conservationCampaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ background: "var(--green-deep)", color: "#fff", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Protect What Matters</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            Conservation
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            Protecting Rwanda&apos;s natural and cultural heritage for future generations
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {/* Campaign cards */}
        {campaigns.length > 0 && (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
              Active Campaigns
            </h2>
            <div className="campaign-grid" style={{ marginBottom: "var(--space-10)" }}>
              {campaigns.map((c) => {
                const raised = Number(c.raisedAmount)
                const goal = Number(c.goalAmount ?? 0)
                const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
                return (
                  <Link key={c.id} href={`/conservation/${c.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }} className="campaign-card card card--interactive">
                    {/* Media */}
                    <div className="campaign-card__media" style={{ background: "var(--green-tint)", position: "relative" }}>
                      {c.imageUrl && (
                        <Image
                          src={c.imageUrl}
                          alt={c.name}
                          fill
                          unoptimized
                          sizes="33vw"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>

                    {/* Body */}
                    <div className="campaign-card__body">
                      <h3>{c.name}</h3>
                      {c.description && <p>{c.description}</p>}

                      {/* Progress bar */}
                      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ marginTop: "var(--space-2)" }}>
                        <div className="progress__fill" style={{ width: `${pct}%` }} />
                      </div>

                      <div className="campaign-card__stats" style={{ marginTop: "var(--space-2)" }}>
                        <span><strong style={{ fontFamily: "var(--font-mono)", color: "var(--green)" }}>{pct}%</strong> funded</span>
                        {goal > 0 && <span>Goal: {goal.toLocaleString()} RWF</span>}
                      </div>
                      <p style={{ marginTop: "var(--space-3)", fontSize: "var(--text-caption)", color: "var(--green)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                        Learn more →
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Donation section */}
        <div style={{ maxWidth: "560px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
            Make a Donation
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", marginBottom: "var(--space-6)" }}>
            Your contribution directly funds conservation efforts on the ground.
          </p>
          <DonationForm campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      </div>
    </div>
  )
}