import { db } from "@/lib/db"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/app/client/dashboard/SignOutButton"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function OperatorPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal")
  if (!["TOUR_OPERATOR", "SUPER_ADMIN"].includes(session.user.role as string)) redirect("/")

  const [operator, unread] = await Promise.all([
    getTourOperatorByUserId(session.user.id),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ])

  const label = operator?.companyName ?? session.user.email ?? "Tour Operator"

  return (
    <DashboardShell
      title="Tour Operator Portal"
      subtitle="Company bookings, custom itineraries, quotations, and operations messages."
      notificationHref="/tour-operators/portal/notifications"
      profileHref="/tour-operators/portal/profile"
      unread={unread}
      user={{
        name: label,
        email: session.user.email,
        image: session.user.image,
        roleLabel: "Tour Operator",
      }}
      nav={[
        { href: "/tour-operators/portal", label: "Dashboard", icon: "layoutDashboard", exact: true },
        { href: "/tour-operators/portal/requests/new", label: "New Request", icon: "plusCircle", exact: true },
        { href: "/tour-operators/portal/requests", label: "Requests", icon: "fileText" },
        { href: "/tour-operators/portal/messages", label: "Messages", icon: "message", exact: true },
        { href: "/tour-operators/portal/notifications", label: "Notifications", icon: "bell", badge: unread, exact: true },
      ]}
      signOut={<SignOutButton />}
    >
      {children}
    </DashboardShell>
  )
}
