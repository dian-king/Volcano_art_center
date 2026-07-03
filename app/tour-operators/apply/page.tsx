import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { submitOperatorApplicationAction } from "@/actions/tour-operators"
import Link from "next/link"
import type { Metadata } from "next"
import { Building2, LockKeyhole, UserRound } from "lucide-react"

export const metadata: Metadata = { title: "Apply as a Tour Operator" }

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

export default async function TourOperatorApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth()
  const user = session?.user
  const sp = await searchParams

  if (user?.id) {
    const existing = await db.tourOperator.findUnique({ where: { userId: user.id } })
    if (existing) redirect("/tour-operators/portal")
  }

  const dbUser = user?.id
    ? await db.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true, phone: true, country: true } })
    : null

  async function apply(fd: FormData) {
    "use server"
    await submitOperatorApplicationAction(fd)
  }

  return (
    <main className="talent-apply">
      <section className="talent-apply-hero">
        <div className="container container--wide">
          <span className="eyebrow">VAC Partners</span>
          <h1>Apply as a Tour Operator</h1>
          <p>Register your company to submit group bookings and custom package requests. If you do not have an account, we will create one during application.</p>
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
                <Building2 size={20} />
                <div>
                  <h2>Company Details</h2>
                  <p>Tell us about the company we'll be partnering with.</p>
                </div>
              </div>
              <div className="talent-apply-grid">
                <Field name="companyName" label="Company name" required />
                <Field name="country" label="Country" defaultValue={dbUser?.country} />
              </div>
            </section>

            <section className="talent-apply-card">
              <div className="talent-apply-card__head">
                <UserRound size={20} />
                <div>
                  <h2>Contact Information</h2>
                  <p>Who should we reach out to about requests and quotations?</p>
                </div>
              </div>
              <div className="talent-apply-grid">
                <Field name="contactName" label="Contact name" required defaultValue={dbUser ? `${dbUser.firstName} ${dbUser.lastName}` : undefined} />
                <Field name="email" label="Email" type="email" required defaultValue={dbUser?.email} />
                <Field name="phone" label="Phone" type="tel" defaultValue={dbUser?.phone} />
              </div>
            </section>

            {!user?.id && (
              <section className="talent-apply-card">
                <div className="talent-apply-card__head">
                  <LockKeyhole size={20} />
                  <div>
                    <h2>Create Your Account</h2>
                    <p>This account will let you sign in to the tour operator portal.</p>
                  </div>
                </div>
                <div className="talent-apply-grid talent-apply-grid--two">
                  <Field name="password" label="Password" type="password" required placeholder="At least 8 characters" />
                  <Field name="confirmPassword" label="Confirm password" type="password" required />
                </div>
                <p className="talent-apply-note">
                  Already have an account? <Link href="/login?next=/tour-operators/apply">Sign in before applying</Link>.
                </p>
              </section>
            )}
          </div>

          <aside className="talent-apply-aside">
            <div>
              <span className="eyebrow">Application</span>
              <h2>Before You Submit</h2>
              <p>Make sure your company name and contact details are complete and correct.</p>
            </div>
            <ul>
              <li>New applicants receive an account automatically.</li>
              <li>You can submit requests right away in the operator portal.</li>
              <li>Our team reviews each request individually.</li>
            </ul>
            <button type="submit" className="btn btn--primary">Submit Application</button>
            <Link href="/" className="btn btn--ghost">Cancel</Link>
          </aside>
        </form>
      </section>
    </main>
  )
}
