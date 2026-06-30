import { createOperatorRequestAction } from "@/actions/tour-operators"
import { db } from "@/lib/db"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { CalendarDays, FileText, PlusCircle, ReceiptText, Send, Users } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

function field(name: string, text: string, value = "", type = "text", required = false) {
  return (
    <div className="operator-field">
      <label>{text}{required && " *"}</label>
      <input name={name} type={type} defaultValue={value} required={required} />
    </div>
  )
}

export default async function NewOperatorRequestPage() {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal/requests/new")

  const [operator, experiences] = await Promise.all([
    getTourOperatorByUserId(session.user.id),
    db.experience.findMany({ where: { status: "PUBLISHED" }, orderBy: { title: "asc" }, select: { slug: true, title: true } }),
  ])
  if (!operator) redirect("/tour-operators/portal/profile")

  return (
    <div className="operator-page">
      <header className="operator-page-header">
        <div>
          <span className="eyebrow">Tour Operator</span>
          <h1>New Booking Request</h1>
          <p>Submit group bookings and custom itinerary requirements for operations review.</p>
        </div>
        <div className="operator-page-header__icon">
          <PlusCircle size={24} />
        </div>
      </header>

      <section className="operator-request-create">
        <form action={createOperatorRequestAction} className="operator-request-form">
          <div className="operator-form-panel">
            <div className="operator-section-heading">
              <FileText size={20} />
              <div>
                <h2>Request Details</h2>
                <p>Give the operations team enough context to price and confirm quickly.</p>
              </div>
            </div>

            <div className="operator-form-grid">
              <div className="operator-field">
                <label>Request type</label>
                <select name="requestType" defaultValue="GROUP_BOOKING">
                  <option value="GROUP_BOOKING">Group booking</option>
                  <option value="CUSTOM_PACKAGE">Custom package</option>
                </select>
              </div>
              <div className="operator-field operator-field--wide">
                <label>Experience</label>
                <select name="experienceSlug">
                  <option value="">Custom / not sure yet</option>
                  {experiences.map(exp => <option key={exp.slug} value={exp.slug}>{exp.title}</option>)}
                </select>
              </div>
              {field("estimatedSize", "Estimated group size", "2", "number", true)}
              {field("estimatedDate", "Estimated date", "", "date")}
              <label className="operator-check">
                <input type="checkbox" name="invoiceRequired" />
                <span>Invoice required</span>
              </label>
              <div className="operator-field operator-field--full">
                <label>Special requests / itinerary details</label>
                <textarea name="specialRequests" rows={8} placeholder="Client profile, guide language, accessibility needs, meals, transport, timing, budget range, or custom itinerary requirements." />
              </div>
            </div>
          </div>

          <aside className="operator-submit-panel">
            <div className="operator-submit-panel__item">
              <Users size={18} />
              <span>Group size helps us assign capacity and guides.</span>
            </div>
            <div className="operator-submit-panel__item">
              <CalendarDays size={18} />
              <span>Flexible dates are welcome if the itinerary is still moving.</span>
            </div>
            <div className="operator-submit-panel__item">
              <ReceiptText size={18} />
              <span>Invoice requests are prepared after operations review.</span>
            </div>
            <button type="submit" className="btn btn--primary">
              <Send size={17} />
              Submit Request
            </button>
          </aside>
        </form>
      </section>
    </div>
  )
}
