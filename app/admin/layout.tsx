import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  if (!role || !["SUPER_ADMIN", "OPS_MANAGER", "CONTENT_MANAGER"].includes(role)) {
    redirect("/login")
  }

  return (
    <div className="admin-body">
      <AdminSidebar />
      {/* Backdrop for mobile sidebar overlay */}
      <div className="admin-sidebar-backdrop" aria-hidden="true" />
      <div className="admin-main" id="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
