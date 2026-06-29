import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { submitTalentApplication } from "@/actions/talent-apply"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Apply to Talent Programme" }

const AREAS = [
  ["TRADITIONAL_DANCE", "Traditional Dance"],
  ["STORYTELLING", "Storytelling"],
  ["CULTURAL_PERFORMANCE", "Cultural Performance"],
  ["MUSIC", "Music"],
  ["VISUAL_ARTS", "Visual Arts"],
  ["CRAFTS", "Crafts"],
  ["OTHER", "Other"],
]

const CATEGORIES = [
  ["YOUTH", "Youth (under 25)"],
  ["SINGLE_MOTHER", "Single Mother"],
  ["PERSON_WITH_DISABILITY", "Person with Disability"],
  ["ELDERLY", "Elderly Artist"],
  ["PROFESSIONAL_ARTIST", "Professional Artist"],
  ["COMMUNITY_MEMBER", "Community Member"],
]

const inp: React.CSSProperties = { height: "44px", padding: "0 var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%" }
const lbl: React.CSSProperties = { fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-1)", display: "block" }
const sel: React.CSSProperties = { ...inp, cursor: "pointer" }
const ta: React.CSSProperties = { ...inp, height: "auto", minHeight: "110px", padding: "var(--space-3) var(--space-4)", resize: "vertical" }
const wrap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-1)" }

export default async function TalentApplyPage() {
  const session = await auth()
  const user = session?.user

  // Already applied → redirect to dashboard
  if (user?.id) {
    const existing = await db.talentApplication.findUnique({ where: { userId: user.id } })
    if (existing) redirect("/talent/dashboard")
  }

  const dbUser = user?.id ? await db.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true } }) : null

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container" style={{ maxWidth: "var(--container-narrow)" }}>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>VAC Programme</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>Apply to the Talent Programme</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            We support emerging Rwandan artists with mentorship, studio space, and exhibition opportunities.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "var(--container-narrow)", paddingBlock: "var(--space-8)" }}>
        <form action={submitTalentApplication} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

          {/* Personal info */}
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-2)" }}>Personal Information</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div style={wrap}><label style={lbl}>First name *</label><input name="firstName" required style={inp} defaultValue={dbUser?.firstName ?? ""} /></div>
              <div style={wrap}><label style={lbl}>Last name *</label><input name="lastName" required style={inp} defaultValue={dbUser?.lastName ?? ""} /></div>
            </div>
            <div style={wrap}><label style={lbl}>Email *</label><input name="email" type="email" required style={inp} defaultValue={dbUser?.email ?? ""} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div style={wrap}><label style={lbl}>Phone</label><input name="phone" type="tel" style={inp} /></div>
              <div style={wrap}><label style={lbl}>Location</label><input name="location" style={inp} placeholder="e.g. Musanze, Northern Province" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div style={wrap}>
                <label style={lbl}>Age range</label>
                <select name="ageRange" style={sel}>
                  <option value="">— Select —</option>
                  {["Under 18","18–25","26–35","36–50","51–65","66+"].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div style={wrap}>
                <label style={lbl}>Gender</label>
                <select name="gender" style={sel}>
                  <option value="">— Select —</option>
                  {["Female","Male","Non-binary","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Talent info */}
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-2)" }}>Your Talent</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div style={wrap}>
                <label style={lbl}>Talent area *</label>
                <select name="talentArea" required style={sel}>
                  <option value="">— Select —</option>
                  {AREAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={wrap}>
                <label style={lbl}>Applicant category *</label>
                <select name="applicantCategory" required style={sel}>
                  <option value="">— Select —</option>
                  {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={wrap}>
              <label style={lbl}>Describe your experience *</label>
              <textarea name="experienceDesc" required rows={4} style={ta} placeholder="Tell us about your artistic background, training, and any performances or exhibitions..." />
            </div>

            <div style={wrap}>
              <label style={lbl}>Why do you want to join VAC? *</label>
              <textarea name="motivation" required rows={4} style={ta} placeholder="What do you hope to achieve through the programme?" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div style={wrap}><label style={lbl}>Availability</label><input name="availability" style={inp} placeholder="e.g. Weekends, school holidays" /></div>
              <div style={wrap}><label style={lbl}>Preferred contact method</label><input name="preferredContact" style={inp} placeholder="e.g. WhatsApp, Email" /></div>
            </div>

            <div style={wrap}><label style={lbl}>Accessibility needs (optional)</label><input name="accessibilityNeeds" style={inp} placeholder="Any accommodations we should know about?" /></div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button type="submit" className="btn btn--primary" style={{ height: "52px", paddingInline: "var(--space-7)", fontSize: "var(--text-body)" }}>
              Submit Application
            </button>
            <Link href="/talent" className="btn btn--ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
