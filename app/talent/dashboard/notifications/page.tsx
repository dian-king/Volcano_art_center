import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationsPanel } from "@/app/client/dashboard/NotificationsPanel"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Notifications | VAC Talent" }

export default async function TalentNotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/talent/apply")

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>Notifications</h1>
      <NotificationsPanel notifications={notifications} />
    </div>
  )
}
