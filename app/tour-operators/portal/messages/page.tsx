import { sendOperatorMessageAction } from "@/actions/tour-operators"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { CheckCircle2, Mail, MessageSquare, Send, ShieldCheck } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function OperatorMessagesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal/messages")
  const operator = await getTourOperatorByUserId(session.user.id)
  if (!operator) redirect("/tour-operators/portal/profile")
  const sp = await searchParams

  return (
    <div className="operator-page">
      <header className="operator-page-header">
        <div>
          <span className="eyebrow">Operations</span>
          <h1>Messages</h1>
          <p>Send clarifications, support questions, and booking context directly to the operations team.</p>
        </div>
        <div className="operator-page-header__icon">
          <MessageSquare size={24} />
        </div>
      </header>

      {sp.message === "sent" && (
        <div className="operator-success">
          <CheckCircle2 size={18} />
          <span>Message sent. Operations will respond through your registered email.</span>
        </div>
      )}

      <section className="operator-message-layout">
        <form action={sendOperatorMessageAction} className="operator-message-form">
          <div className="operator-section-heading">
            <MessageSquare size={20} />
            <div>
              <h2>Message Operations</h2>
              <p>Use this for quotation questions, timing changes, guest needs, or follow-up details.</p>
            </div>
          </div>

          <div className="operator-field">
            <label>Subject *</label>
            <input name="subject" required placeholder="Example: Confirmation details for Friday group booking" />
          </div>
          <div className="operator-field">
            <label>Message *</label>
            <textarea name="message" required rows={9} placeholder="Write the details the operations team needs to act on your request." />
          </div>
          <div className="operator-form-actions">
            <button type="submit" className="btn btn--primary">
              <Send size={17} />
              Send Message
            </button>
          </div>
        </form>

        <aside className="operator-contact-panel">
          <div>
            <span className="eyebrow">Company</span>
            <h2>{operator.companyName}</h2>
            <p>{operator.contactName}</p>
          </div>
          <div className="operator-contact-panel__row">
            <Mail size={18} />
            <span>{operator.email}</span>
          </div>
          <div className="operator-contact-panel__row">
            <ShieldCheck size={18} />
            <span>Messages are logged as operations inquiries for follow-up.</span>
          </div>
        </aside>
      </section>
    </div>
  )
}
