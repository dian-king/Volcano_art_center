import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Messages | VAC Talent" }

async function sendMessage(fd: FormData) {
  "use server"
  const { auth } = await import("@/lib/auth")
  const { db } = await import("@/lib/db")
  const session = await auth()
  if (!session?.user?.id) return

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { email: true, firstName: true, lastName: true } })
  await db.contactInquiry.create({
    data: {
      name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email ?? "Talent Applicant",
      email: user?.email ?? "",
      subject: `[Talent Portal] ${fd.get("subject") as string || "General enquiry"}`,
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

  const inp: React.CSSProperties = { height: "44px", padding: "0 var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%" }
  const lbl: React.CSSProperties = { fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-1)", display: "block" }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>Messages</h1>

      {sent && (
        <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", marginBottom: "var(--space-6)", fontSize: "var(--text-small)", color: "var(--color-success)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
          ✓ Message sent — our team will respond within 2 business days.
        </div>
      )}

      <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
        <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginBottom: "var(--space-5)", lineHeight: 1.7 }}>
          Send a message directly to the VAC team. We respond within 2 business days.
        </p>

        <form action={sendMessage} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={lbl}>Subject</label>
            <input name="subject" required style={inp} placeholder="e.g. Question about my application" />
          </div>
          <div>
            <label style={lbl}>Message *</label>
            <textarea name="message" required rows={6} style={{ ...inp, height: "auto", padding: "var(--space-3) var(--space-4)", resize: "vertical" }} placeholder="Write your message here…" />
          </div>
          <button type="submit" className="btn btn--primary" style={{ alignSelf: "flex-start" }}>Send Message</button>
        </form>
      </div>

      <div style={{ marginTop: "var(--space-6)", padding: "var(--space-4)", background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
        <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "var(--space-1)" }}>Other ways to reach us</strong>
        You can also email us directly at <strong>talent@volcanoarts.rw</strong> or call <strong>+250 780 000 000</strong>
      </div>
    </div>
  )
}
