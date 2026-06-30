import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { db } from "@/lib/db"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  if (!session?.user?.id || !role || !["SUPER_ADMIN", "OPS_MANAGER", "CONTENT_MANAGER"].includes(role)) {
    redirect("/login")
  }
  const [unread, user] = await Promise.all([
    db.notification.count({ where: { userId: session.user.id, read: false } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true, image: true, profileImageUrl: true },
    }),
  ])

  return (
    <div className="admin-body">
      <AdminSidebar />
      {/* Backdrop for mobile sidebar overlay */}
      <div className="admin-sidebar-backdrop" aria-hidden="true" />
      <div className="admin-main" id="admin-main">
        <AdminTopbar
          unread={unread}
          user={{
            name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "Admin",
            email: user?.email,
            image: user?.profileImageUrl || user?.image,
            role,
          }}
        />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
