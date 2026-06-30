import { saveOperatorProfileAction } from "@/actions/tour-operators"
import { db } from "@/lib/db"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const card: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-5)",
}

const input: React.CSSProperties = {
  height: 42,
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface-base)",
  color: "var(--text-primary)",
  padding: "0 var(--space-3)",
  fontFamily: "var(--font-ui)",
  fontSize: "var(--text-small)",
  width: "100%",
}

const label: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-ui)",
  fontSize: "var(--text-caption)",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "var(--space-1)",
}

function field(name: string, text: string, value = "", type = "text", required = false) {
  return (
    <div>
      <label style={label}>{text}{required && " *"}</label>
      <input name={name} type={type} defaultValue={value} required={required} style={input} />
    </div>
  )
}

export default async function OperatorProfilePage() {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal/profile")

  const [operator, user] = await Promise.all([
    getTourOperatorByUserId(session.user.id),
    db.user.findUnique({ where: { id: session.user.id }, select: { email: true, firstName: true, lastName: true, phone: true, country: true } }),
  ])

  return (
    <div style={{ maxWidth: 820, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <header>
        <span className="eyebrow">Company</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Operator Profile</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>Keep your company and primary contact details up to date.</p>
      </header>

      <form action={saveOperatorProfileAction} style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        {field("companyName", "Company name", operator?.companyName ?? "", "text", true)}
        {field("contactName", "Contact name", operator?.contactName ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(), "text", true)}
        {field("email", "Email", operator?.email ?? user?.email ?? "", "email", true)}
        {field("phone", "Phone", operator?.phone ?? user?.phone ?? "", "tel")}
        {field("country", "Country", operator?.country ?? user?.country ?? "")}
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn--primary">Save Profile</button>
        </div>
      </form>
    </div>
  )
}
