import { SignOutButton } from "@/app/client/dashboard/SignOutButton"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/profile")

  const [user, unread] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { email: true, firstName: true, lastName: true, name: true, image: true, profileImageUrl: true } }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ])
  if (!user) redirect("/login")

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.name || user.email

  return (
    <DashboardShell
      title="My Account"
      subtitle="Orders, bookings, saved artwork, profile settings, and notifications."
      notificationHref="/client/dashboard/notifications"
      profileHref="/client/dashboard/profile"
      unread={unread}
      user={{ name: displayName, email: user.email, image: user.profileImageUrl || user.image, roleLabel: "Client" }}
      nav={[
        { href: "/client/dashboard/profile", label: "Profile", icon: "user", exact: true },
        { href: "/client/dashboard/orders", label: "Orders", icon: "shoppingBag", exact: true },
        { href: "/client/dashboard/bookings", label: "Bookings", icon: "calendar", exact: true },
        { href: "/client/dashboard/donations", label: "Donations", icon: "heartHandshake", exact: true },
        { href: "/client/dashboard/saved", label: "Saved Items", icon: "heart", exact: true },
        { href: "/client/dashboard/notifications", label: "Notifications", icon: "bell", badge: unread, exact: true },
        { href: "/client/dashboard/security", label: "Security", icon: "shield", exact: true },
        { href: "/client/dashboard/danger", label: "Danger Zone", icon: "trash", danger: true, exact: true },
      ]}
      signOut={<SignOutButton />}
    >
      {children}
    </DashboardShell>
  )
}
