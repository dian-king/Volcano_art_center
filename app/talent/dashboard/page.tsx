import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "My Application | VAC Talent" }

const STATUS: Record<string, { label: string; color: string; bg: string; note: string }> = {
  PENDING:       { label: "Under Review",  color: "#d97706", bg: "rgba(217,119,6,0.1)",  note: "Your application is being reviewed. We typically respond within 2 weeks." },
  AWAITING_INFO: { label: "Info Needed",   color: "#2563eb", bg: "rgba(37,99,235,0.1)",  note: "We need more information. Please read the feedback below and contact us." },
  APPROVED:      { label: "Approved",      color: "#16a34a", bg: "rgba(22,163,74,0.1)",  note: "Congratulations! Your application has been approved. Our team will be in touch soon." },
  REJECTED:      { label: "Unsuccessful",  color: "#dc2626", bg: "rgba(220,38,38,0.1)",  note: "Thank you for applying. Unfortunately we cannot offer you a place this round. You may reapply next quarter." },
  ARCHIVED:      { label: "Archived",      color: "#6b7280", bg: "rgba(107,114,128,0.1)", note: "This application has been archived." },
}

export default async function TalentDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/apply")

  const application = await db.talentApplication.findUnique({ where: { userId: session.user.id } })
  if (!application) redirect("/talent/apply")

  const profile = await db.talentProfile.findUnique({ where: { userId: session.user.id } })
  const cfg = STATUS[application.status] ?? STATUS.PENDING

  const row = (label: string, value: string) => (
    <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>{label}</span>
      <span style={{ fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{value}</span>
    </div>
  )

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>My Application</h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", marginTop: "var(--space-1)" }}>{application.reference}</p>
      </div>

      {/* Status */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}44`, borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: cfg.color, fontSize: "var(--text-body)" }}>{cfg.label}</span>
        </div>
        <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{cfg.note}</p>
        {application.staffFeedback && (
          <div style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", background: "var(--surface-raised)", borderRadius: "var(--radius-md)", borderLeft: `3px solid ${cfg.color}` }}>
            <p style={{ fontSize: "var(--text-caption)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-2)" }}>Team Feedback</p>
            <p style={{ fontSize: "var(--text-small)", color: "var(--text-primary)", lineHeight: 1.7 }}>{application.staffFeedback}</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-5)" }}>Application Details</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
          {row("Name", `${application.firstName} ${application.lastName}`)}
          {row("Email", application.email)}
          {row("Talent Area", application.talentArea.replace(/_/g, " "))}
          {row("Category", application.applicantCategory.replace(/_/g, " "))}
          {row("Location", application.location ?? "—")}
          {row("Submitted", new Date(application.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}
        </div>
      </div>

      {/* Profile status */}
      {profile ? (
        <div style={{ background: "var(--surface-raised)", border: `1px solid ${profile.published ? "var(--green)" : "var(--border-subtle)"}`, borderRadius: "var(--radius-lg)", padding: "var(--space-5)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
          <div>
            <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: profile.published ? "var(--green)" : "var(--text-primary)" }}>
              {profile.published ? "Your profile is live on the talent directory" : "Your profile is being prepared"}
            </p>
            <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)", marginTop: 4 }}>{profile.displayName} · {profile.talentArea.replace(/_/g, " ")}</p>
          </div>
          {profile.published && <Link href="/talent" className="btn btn--primary btn--sm">View Profile →</Link>}
        </div>
      ) : application.status === "APPROVED" && (
        <div style={{ background: "var(--green-tint)", border: "1px solid var(--green)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--green)" }}>Profile coming soon</p>
          <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginTop: 4 }}>Our content team is setting up your public talent profile.</p>
        </div>
      )}
    </div>
  )
}
