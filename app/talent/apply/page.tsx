import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { submitTalentApplication } from "@/actions/talent-apply"
import Link from "next/link"
import type { Metadata } from "next"
import { FileText, LockKeyhole, Sparkles, UserRound } from "lucide-react"

export const metadata: Metadata = { title: "Apply to Talent Programme" }

const PROGRAMS = [
  ["TALENT_DEVELOPMENT", "Talent Development Programme"],
  ["YOUTH_ARTS", "Youth Arts Mentorship"],
  ["WOMEN_CREATIVES", "Women Creatives Programme"],
  ["COMMUNITY_PERFORMANCE", "Community Performance Programme"],
  ["VISUAL_ARTS_RESIDENCY", "Visual Arts Residency"],
]

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
  ["PERSON_WITH_DISABILITY", "Person with disability"],
  ["ELDERLY", "Elderly artist"],
  ["PROFESSIONAL_ARTIST", "Professional artist"],
  ["COMMUNITY_MEMBER", "Community member"],
]

const AGE_RANGES = ["Under 18", "18-25", "26-35", "36-50", "51-65", "66+"]
const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"]
const CONTACT_METHODS = ["Email", "Phone call", "WhatsApp", "SMS"]

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  defaultValue?: string | null
  placeholder?: string
}) {
  return (
    <div className="talent-apply-field">
      <label htmlFor={name}>{label}{required ? " *" : ""}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} />
    </div>
  )
}

function SelectField({
  name,
  label,
  options,
  required,
}: {
  name: string
  label: string
  options: string[] | string[][]
  required?: boolean
}) {
  return (
    <div className="talent-apply-field">
      <label htmlFor={name}>{label}{required ? " *" : ""}</label>
      <select id={name} name={name} required={required} defaultValue="">
        <option value="">Select...</option>
        {options.map(option => {
          const value = Array.isArray(option) ? option[0] : option
          const labelText = Array.isArray(option) ? option[1] : option
          return <option key={value} value={value}>{labelText}</option>
        })}
      </select>
    </div>
  )
}

export default async function TalentApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth()
  const user = session?.user
  const sp = await searchParams

  if (user?.id) {
    const existing = await db.talentApplication.findUnique({ where: { userId: user.id } })
    if (existing) redirect("/talent/dashboard")
  }

  const dbUser = user?.id
    ? await db.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true, phone: true, country: true } })
    : null

  async function apply(fd: FormData) {
    "use server"
    await submitTalentApplication(fd)
  }

  return (
    <main className="talent-apply">
      <section className="talent-apply-hero">
        <div className="container container--wide">
          <span className="eyebrow">VAC Programme</span>
          <h1>Apply to a Talent Programme</h1>
          <p>Select the programme you want to join and submit your details. If you do not have an account, we will create one during application.</p>
        </div>
      </section>

      <section className="container container--wide talent-apply-shell">
        {sp.error && (
          <div className="talent-apply-error" role="alert">
            {sp.error}
          </div>
        )}

        <form action={apply} className="talent-apply-form">
          <div className="talent-apply-main">
            <section className="talent-apply-card">
              <div className="talent-apply-card__head">
                <Sparkles size={20} />
                <div>
                  <h2>Programme</h2>
                  <p>Choose the programme that best matches your goals.</p>
                </div>
              </div>
              <SelectField name="program" label="Programme" options={PROGRAMS} required />
            </section>

            <section className="talent-apply-card">
              <div className="talent-apply-card__head">
                <UserRound size={20} />
                <div>
                  <h2>Personal Information</h2>
                  <p>Your contact details help the team follow up on your application.</p>
                </div>
              </div>
              <div className="talent-apply-grid">
                <Field name="firstName" label="First name" required defaultValue={dbUser?.firstName} />
                <Field name="lastName" label="Last name" required defaultValue={dbUser?.lastName} />
                <Field name="email" label="Email" type="email" required defaultValue={dbUser?.email} />
                <Field name="phone" label="Phone" type="tel" defaultValue={dbUser?.phone} />
                <Field name="location" label="Location" placeholder="Musanze, Northern Province" defaultValue={dbUser?.country} />
                <SelectField name="preferredContact" label="Preferred contact" options={CONTACT_METHODS} />
                <SelectField name="ageRange" label="Age range" options={AGE_RANGES} />
                <SelectField name="gender" label="Gender" options={GENDERS} />
              </div>
            </section>

            {!user?.id && (
              <section className="talent-apply-card">
                <div className="talent-apply-card__head">
                  <LockKeyhole size={20} />
                  <div>
                    <h2>Create Your Account</h2>
                    <p>This account will let you track your application and manage your talent dashboard.</p>
                  </div>
                </div>
                <div className="talent-apply-grid talent-apply-grid--two">
                  <Field name="password" label="Password" type="password" required placeholder="At least 8 characters" />
                  <Field name="confirmPassword" label="Confirm password" type="password" required />
                </div>
                <p className="talent-apply-note">
                  Already have an account? <Link href="/login?next=/talent/apply">Sign in before applying</Link>.
                </p>
              </section>
            )}

            <section className="talent-apply-card">
              <div className="talent-apply-card__head">
                <FileText size={20} />
                <div>
                  <h2>Your Talent</h2>
                  <p>Tell us about your practice, your needs, and why this programme fits you.</p>
                </div>
              </div>
              <div className="talent-apply-grid">
                <SelectField name="talentArea" label="Talent area" options={AREAS} required />
                <SelectField name="applicantCategory" label="Applicant category" options={CATEGORIES} required />
                <Field name="availability" label="Availability" placeholder="Weekends, evenings, school holidays" />
                <Field name="accessibilityNeeds" label="Accessibility needs" placeholder="Any accommodations we should know about?" />
              </div>
              <div className="talent-apply-textareas">
                <div className="talent-apply-field">
                  <label htmlFor="experienceDesc">Describe your experience *</label>
                  <textarea id="experienceDesc" name="experienceDesc" required rows={5} placeholder="Tell us about your artistic background, training, performances, exhibitions, or community work." />
                </div>
                <div className="talent-apply-field">
                  <label htmlFor="motivation">Why do you want to join? *</label>
                  <textarea id="motivation" name="motivation" required rows={5} placeholder="What do you hope to learn, create, or contribute through the programme?" />
                </div>
              </div>
            </section>
          </div>

          <aside className="talent-apply-aside">
            <div>
              <span className="eyebrow">Application</span>
              <h2>Before You Submit</h2>
              <p>Make sure your selected programme, contact details, talent area, and motivation are complete.</p>
            </div>
            <ul>
              <li>Programme selection is required.</li>
              <li>New applicants receive an account automatically.</li>
              <li>You can track progress in the talent dashboard.</li>
            </ul>
            <button type="submit" className="btn btn--primary">Submit Application</button>
            <Link href="/talent" className="btn btn--ghost">Cancel</Link>
          </aside>
        </form>
      </section>
    </main>
  )
}
