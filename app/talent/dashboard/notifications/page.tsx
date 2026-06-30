import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationsPanel } from "@/app/client/dashboard/NotificationsPanel"
import type { Metadata } from "next"
import { Bell } from "lucide-react"

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
    <div className="talent-dashboard-page">
      <header className="talent-dashboard-hero">
        <div>
          <span className="eyebrow">Updates</span>
          <h1>Notifications</h1>
          <p>Application updates, profile notes, and messages from the VAC team.</p>
        </div>
        <div className="talent-dashboard-hero__icon"><Bell size={24} /></div>
      </header>

      <section className="talent-dashboard-card">
        <NotificationsPanel notifications={notifications} />
      </section>
    </div>
  )
}
