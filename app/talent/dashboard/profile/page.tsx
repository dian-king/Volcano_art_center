import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "My Profile | VAC Talent" }

export default async function TalentProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/apply")

  const profile = await db.talentProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile) return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-4)" }}>My Profile</h1>
      <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-7)", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", marginBottom: "var(--space-5)" }}>
          Your public profile has not been created yet. Once your application is approved, our content team will set up your profile.
        </p>
        <Link href="/talent/dashboard" className="btn btn--ghost btn--sm">← Back to Application</Link>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>My Profile</h1>
        {profile.published
          ? <span className="chip chip--success">Live on directory</span>
          : <span className="chip chip--neutral">Draft — not yet public</span>
        }
      </div>

      <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", background: "var(--green-tint)", border: "3px solid var(--green)", position: "relative", flexShrink: 0 }}>
          {profile.imageUrl
            ? <Image src={profile.imageUrl} alt={profile.displayName} fill unoptimized style={{ objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--green)" }}>{profile.displayName.charAt(0)}</div>
          }
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-title)", color: "var(--text-primary)" }}>{profile.displayName}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>{profile.talentArea.replace(/_/g, " ")} · {profile.category.replace(/_/g, " ")}</p>
          {profile.bio && <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", lineHeight: 1.7, maxWidth: "48ch" }}>{profile.bio}</p>}
          {profile.published && <Link href="/talent" className="btn btn--primary btn--sm" style={{ alignSelf: "flex-start", marginTop: "var(--space-2)" }}>View on Talent Directory →</Link>}
        </div>
      </div>

      <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
        To update your profile details, contact our content team at <strong>content@volcanoarts.rw</strong>
      </p>
    </div>
  )
}
