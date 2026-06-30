import { NotificationsPanel } from "@/app/client/dashboard/NotificationsPanel"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { card } from "../_styles"

export const dynamic = "force-dynamic"

export default async function ClientNotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/notifications")
  const notifications = await db.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 30 })

  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>Notifications</h1>
      <NotificationsPanel notifications={notifications} />
    </section>
  )
}
