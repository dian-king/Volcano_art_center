import { SignOutButton } from "@/app/client/dashboard/SignOutButton"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function TalentDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/dashboard")

  const [user, unread] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { email: true, firstName: true, lastName: true, name: true, image: true, profileImageUrl: true } }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ])
  if (!user) redirect("/login")

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.name || user.email

  return (
    <DashboardShell
      title="Talent Dashboard"
      subtitle="Application status, profile, portfolio, messages, and notifications."
      notificationHref="/talent/dashboard/notifications"
      profileHref="/talent/dashboard/profile"
      unread={unread}
      user={{ name: displayName, email: user.email, image: user.profileImageUrl || user.image, roleLabel: "Talent Applicant" }}
      nav={[
        { href: "/talent/dashboard", label: "Application", icon: "layoutDashboard", exact: true },
        { href: "/talent/dashboard/profile", label: "Profile", icon: "user", exact: true },
        { href: "/talent/dashboard/portfolio", label: "Portfolio", icon: "briefcase", exact: true },
        { href: "/talent/dashboard/messages", label: "Messages", icon: "message", exact: true },
        { href: "/talent/dashboard/notifications", label: "Notifications", icon: "bell", badge: unread, exact: true },
      ]}
      signOut={<SignOutButton />}
    >
      {children}
    </DashboardShell>
  )
}
