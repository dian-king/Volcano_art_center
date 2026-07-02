import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { CheckCircle2, Mail, MessageSquare, Send } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Messages | VAC Talent" }

async function sendMessage(fd: FormData) {
  "use server"
  const { auth } = await import("@/lib/auth")
  const { db } = await import("@/lib/db")
  const session = await auth()
  if (!session?.user?.id) return

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { email: true, firstName: true, lastName: true } })
  const displayName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "Talent Applicant"
  const subject = (fd.get("subject") as string) || "General enquiry"
  await db.contactInquiry.create({
    data: {
      name: displayName,
      email: user?.email ?? "",
      subject: `[Talent Portal] ${subject}`,
      message: fd.get("message") as string,
      status: "NEW",
    },
  })
  redirect("/talent/dashboard/messages?sent=1")
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/apply")
  const sp = await searchParams
  const sent = sp.sent === "1"

  return (
    <div className="talent-dashboard-page">
      <header className="talent-dashboard-hero">
        <div>
          <span className="eyebrow">Support</span>
          <h1>Messages</h1>
          <p>Send questions about your application, profile, portfolio, or next steps to the VAC team.</p>
        </div>
        <div className="talent-dashboard-hero__icon"><MessageSquare size={24} /></div>
      </header>

      {sent && (
        <div className="talent-dashboard-success">
          <CheckCircle2 size={18} />
          <span>Message sent. Our team will respond within 2 business days.</span>
        </div>
      )}

      <section className="talent-message-layout">
        <form action={sendMessage} className="talent-dashboard-card talent-message-form">
          <div className="talent-dashboard-section-head">
            <h2>Message Team</h2>
            <span>Talent Portal</span>
          </div>
          <div className="talent-field">
            <label>Subject</label>
            <input name="subject" required placeholder="Example: Question about my application" />
          </div>
          <div className="talent-field">
            <label>Message *</label>
            <textarea name="message" required rows={8} placeholder="Write your message here..." />
          </div>
          <button type="submit" className="btn btn--primary">
            <Send size={17} />
            Send Message
          </button>
        </form>

        <aside className="talent-dashboard-card talent-contact-panel">
          <Mail size={22} />
          <h2>Other ways to reach us</h2>
          <p>You can also email the talent team directly or call the center during business hours.</p>
          <div>
            <strong>talent@volcanoarts.rw</strong>
            <span>+250 788 945 163</span>
          </div>
        </aside>
      </section>
    </div>
  )
}
