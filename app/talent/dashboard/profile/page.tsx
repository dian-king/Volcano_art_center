import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { ExternalLink, UserRound } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "My Profile | VAC Talent" }

export default async function TalentProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/apply")

  const profile = await db.talentProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile) {
    return (
      <div className="talent-dashboard-page">
        <header className="talent-dashboard-hero">
          <div>
            <span className="eyebrow">Public Profile</span>
            <h1>My Profile</h1>
            <p>Your public profile has not been created yet. Once your application is approved, our content team will prepare it.</p>
          </div>
          <div className="talent-dashboard-hero__icon"><UserRound size={24} /></div>
        </header>

        <section className="talent-dashboard-card talent-dashboard-empty">
          <div className="talent-dashboard-icon"><UserRound size={24} /></div>
          <div>
            <h2>Profile not available yet</h2>
            <p>Keep your application and portfolio up to date while the team reviews your submission.</p>
          </div>
          <div className="talent-dashboard-actions">
            <Link href="/talent/dashboard" className="btn btn--ghost">Back to Application</Link>
            <Link href="/talent/dashboard/portfolio" className="btn btn--primary">Manage Portfolio</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="talent-dashboard-page">
      <header className="talent-dashboard-hero">
        <div>
          <span className="eyebrow">Public Profile</span>
          <h1>My Profile</h1>
          <p>Your directory profile preview and publication status.</p>
        </div>
        {profile.published ? <span className="chip chip--success">Live on directory</span> : <span className="chip chip--neutral">Draft</span>}
      </header>

      <section className="talent-profile-card">
        <div className="talent-profile-card__avatar">
          {profile.imageUrl ? (
            <Image src={profile.imageUrl} alt={profile.displayName} fill style={{ objectFit: "cover" }} />
          ) : (
            <span>{profile.displayName.charAt(0)}</span>
          )}
        </div>
        <div className="talent-profile-card__body">
          <span className="eyebrow">{profile.talentArea.replace(/_/g, " ")}</span>
          <h2>{profile.displayName}</h2>
          <p className="talent-profile-card__meta">{profile.category.replace(/_/g, " ")}</p>
          {profile.bio && <p className="talent-profile-card__bio">{profile.bio}</p>}
          {profile.published && (
            <Link href="/talent" className="btn btn--primary btn--sm">
              <ExternalLink size={15} />
              View on Talent Directory
            </Link>
          )}
        </div>
      </section>

      <section className="talent-dashboard-card talent-dashboard-profile-strip">
        <div>
          <p>Profile updates</p>
          <span>To update your public profile details, message the content team from your dashboard.</span>
        </div>
        <Link href="/talent/dashboard/messages" className="btn btn--ghost btn--sm">Message Team</Link>
      </section>
    </div>
  )
}
