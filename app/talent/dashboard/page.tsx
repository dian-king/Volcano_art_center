import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Clock3, FileText, MessageSquare, UserRound } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "My Application | VAC Talent" }

const STATUS: Record<string, { label: string; color: string; bg: string; note: string }> = {
  PENDING: { label: "Under Review", color: "#d97706", bg: "rgba(217,119,6,0.1)", note: "Your application is being reviewed. We typically respond within 2 weeks." },
  AWAITING_INFO: { label: "Info Needed", color: "#2563eb", bg: "rgba(37,99,235,0.1)", note: "We need more information. Please read the feedback below and contact us." },
  APPROVED: { label: "Approved", color: "#16a34a", bg: "rgba(22,163,74,0.1)", note: "Congratulations! Your application has been approved. Our team will be in touch soon." },
  REJECTED: { label: "Unsuccessful", color: "#dc2626", bg: "rgba(220,38,38,0.1)", note: "Thank you for applying. Unfortunately we cannot offer you a place this round. You may reapply next quarter." },
  ARCHIVED: { label: "Archived", color: "#6b7280", bg: "rgba(107,114,128,0.1)", note: "This application has been archived." },
}

function detail(label: string, value: string) {
  return (
    <div key={label} className="talent-dashboard-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default async function TalentDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/apply")

  const [application, profile] = await Promise.all([
    db.talentApplication.findUnique({ where: { userId: session.user.id } }),
    db.talentProfile.findUnique({ where: { userId: session.user.id } }),
  ])

  if (!application) {
    return (
      <div className="talent-dashboard-page">
        <header className="talent-dashboard-hero">
          <div>
            <span className="eyebrow">Talent Portal</span>
            <h1>Talent Dashboard</h1>
            <p>You are signed in as a talent applicant. Your application record is not available yet, but you can stay in your dashboard and continue setting up your profile.</p>
          </div>
          <div className="talent-dashboard-hero__icon"><UserRound size={24} /></div>
        </header>

        <section className="talent-dashboard-card talent-dashboard-empty">
          <div className="talent-dashboard-icon"><FileText size={24} /></div>
          <div>
            <h2>No application record found</h2>
            <p>This can happen if your account was upgraded manually or your application is still being linked. You can submit an application, update your profile, or contact the team from messages.</p>
          </div>
          <div className="talent-dashboard-actions">
            <Link href="/talent/apply" className="btn btn--primary">Submit Application</Link>
            <Link href="/talent/dashboard/profile" className="btn btn--ghost">Edit Profile</Link>
            <Link href="/talent/dashboard/messages" className="btn btn--ghost">Message Team</Link>
          </div>
        </section>

        {profile && (
          <section className="talent-dashboard-card talent-dashboard-profile-strip">
            <div>
              <p className={profile.published ? "is-live" : undefined}>
                {profile.published ? "Your profile is live on the talent directory" : "Your profile is saved"}
              </p>
              <span>{profile.displayName} - {profile.talentArea.replace(/_/g, " ")}</span>
            </div>
            {profile.published && <Link href="/talent" className="btn btn--primary btn--sm">View Profile</Link>}
          </section>
        )}
      </div>
    )
  }

  const cfg = STATUS[application.status] ?? STATUS.PENDING

  return (
    <div className="talent-dashboard-page">
      <header className="talent-dashboard-hero">
        <div>
          <span className="eyebrow">Application</span>
          <h1>My Application</h1>
          <p>{application.reference}</p>
        </div>
        <div className="talent-dashboard-hero__icon"><FileText size={24} /></div>
      </header>

      <section className="talent-dashboard-status" style={{ ["--status-color" as string]: cfg.color, ["--status-bg" as string]: cfg.bg }}>
        <div className="talent-dashboard-status__heading">
          <Clock3 size={18} />
          <span>{cfg.label}</span>
        </div>
        <p>{cfg.note}</p>
        {application.staffFeedback && (
          <div className="talent-dashboard-feedback">
            <strong>Team Feedback</strong>
            <p>{application.staffFeedback}</p>
          </div>
        )}
      </section>

      <section className="talent-dashboard-card">
        <div className="talent-dashboard-section-head">
          <h2>Application Details</h2>
          <span>{application.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
        <div className="talent-dashboard-details-grid">
          {detail("Programme", ((application as any).program ?? "TALENT_DEVELOPMENT").replace(/_/g, " "))}
          {detail("Name", `${application.firstName} ${application.lastName}`)}
          {detail("Email", application.email)}
          {detail("Talent Area", application.talentArea.replace(/_/g, " "))}
          {detail("Category", application.applicantCategory.replace(/_/g, " "))}
          {detail("Location", application.location ?? "-")}
          {detail("Submitted", application.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}
        </div>
      </section>

      {profile ? (
        <section className="talent-dashboard-card talent-dashboard-profile-strip">
          <div>
            <p className={profile.published ? "is-live" : undefined}>
              {profile.published ? "Your profile is live on the talent directory" : "Your profile is being prepared"}
            </p>
            <span>{profile.displayName} - {profile.talentArea.replace(/_/g, " ")}</span>
          </div>
          {profile.published && <Link href="/talent" className="btn btn--primary btn--sm">View Profile</Link>}
        </section>
      ) : application.status === "APPROVED" && (
        <section className="talent-dashboard-card talent-dashboard-profile-strip">
          <div>
            <p className="is-live">Profile coming soon</p>
            <span>Our content team is setting up your public talent profile.</span>
          </div>
          <Link href="/talent/dashboard/messages" className="btn btn--ghost btn--sm">
            <MessageSquare size={15} />
            Message Team
          </Link>
        </section>
      )}
    </div>
  )
}
