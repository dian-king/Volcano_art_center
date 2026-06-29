import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/app/client/dashboard/SignOutButton"
import { db } from "@/lib/db"

export default async function TalentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?next=/talent/apply")

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true },
  })

  const displayName = dbUser?.firstName
    ? `${dbUser.firstName} ${dbUser.lastName}`.trim()
    : session.user.email?.split("@")[0] ?? "Applicant"

  const initial = displayName.charAt(0).toUpperCase()

  const unread = await db.notification.count({
    where: { userId: session.user.id!, read: false },
  })

  const navItems = [
    { href: "/talent/dashboard",              label: "My Application" },
    { href: "/talent/dashboard/profile",      label: "My Profile" },
    { href: "/talent/dashboard/portfolio",    label: "Portfolio" },
    { href: "/talent/dashboard/messages",     label: "Messages" },
    { href: "/talent/dashboard/notifications",label: "Notifications", badge: unread },
  ]

  const lnk: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    color: "rgba(255,255,255,0.8)", fontSize: "var(--text-small)",
    padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-ui)", textDecoration: "none", background: "transparent",
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "220px 1fr" }}>
      <aside style={{ background: "#0a2e1a", color: "#fff", padding: "var(--space-5)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Avatar + name — truncated */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-7)", minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--green)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName.split(" ")[0]}
            </p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-caption)", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Talent Applicant
            </p>
          </div>
        </div>

        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", padding: "0 var(--space-2)", marginBottom: "var(--space-2)", fontFamily: "var(--font-ui)" }}>
          My Portal
        </p>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ href, label, badge }) => (
            <Link key={href} href={href} style={lnk}>
              <span>{label}</span>
              {badge ? (
                <span style={{ background: "var(--green)", color: "#fff", borderRadius: "var(--radius-pill)", minWidth: 18, height: 18, display: "grid", placeItems: "center", fontSize: 10, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "var(--space-4)", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Link href="/" style={{ ...lnk, color: "rgba(255,255,255,0.6)" }}>← View Site</Link>
          <SignOutButton />
        </div>
      </aside>

      <main style={{ background: "var(--surface)", minHeight: "100vh", padding: "var(--space-8)" }}>
        {children}
      </main>
    </div>
  )
}
