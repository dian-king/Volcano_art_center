import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp, Heart, UserPlus, AlertCircle,
  Palette, Map, Leaf, Feather, Sparkles, Star,
  CalendarCheck, Package, FileText, Mail,
  ChevronRight,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const session = await auth()
  const role = (session?.user as any)?.role as string

  if (role === "CONTENT_MANAGER") redirect("/admin/content/dashboard")

  const isContent = ["CONTENT_MANAGER", "SUPER_ADMIN"].includes(role)
  const isOps     = ["OPS_MANAGER",     "SUPER_ADMIN"].includes(role)
  const isSuper   = role === "SUPER_ADMIN"

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalProducts, totalExperiences, totalCampaigns, totalPosts, totalProfiles, pendingReviews,
    pendingBookings, pendingOrders, pendingApplications, newInquiries,
    recentOrders, recentBookings, recentApplications, recentInquiries,
    newUsersThisWeek, totalRevenue, totalDonations,
  ] = await Promise.all([
    isContent ? db.product.count() : Promise.resolve(0),
    isContent ? db.experience.count() : Promise.resolve(0),
    isContent ? db.conservationCampaign.count() : Promise.resolve(0),
    isContent ? db.blogPost.count() : Promise.resolve(0),
    isContent ? db.talentProfile.count({ where: { published: true } }) : Promise.resolve(0),
    isContent ? db.review.count({ where: { approved: false } }) : Promise.resolve(0),
    isOps ? db.booking.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    isOps ? db.order.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    isOps ? db.talentApplication.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    isOps ? db.contactInquiry.count({ where: { status: "NEW" } }) : Promise.resolve(0),
    isOps ? db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { email: true } } } }) : Promise.resolve([]),
    isOps ? db.booking.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { experience: { select: { title: true } } } }) : Promise.resolve([]),
    isOps ? db.talentApplication.findMany({ orderBy: { createdAt: "desc" }, take: 3 }) : Promise.resolve([]),
    isOps ? db.contactInquiry.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 3 }) : Promise.resolve([]),
    isSuper ? db.user.count({ where: { createdAt: { gte: weekAgo } } }) : Promise.resolve(0),
    isSuper ? db.order.aggregate({ where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING"] } }, _sum: { total: true } }) : Promise.resolve({ _sum: { total: null } }),
    isSuper ? db.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: null } }),
  ])

  const revenue  = Number(totalRevenue._sum.total ?? 0)
  const donations = Number(totalDonations._sum.amount ?? 0)
  const pendingTotal = pendingBookings + pendingOrders + pendingApplications + newInquiries

  type KpiCard = { icon: React.ElementType; label: string; value: string | number; href: string; amber?: boolean; green?: boolean; sub?: string }

  function KpiGrid({ cards }: { cards: KpiCard[] }) {
    return (
      <div className="vac-dashboard-kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        {cards.map(({ icon: Icon, label, value, href, amber, green, sub }) => (
          <Link key={label} href={href} className="vac-dashboard-kpi-card">
            <div
              className="vac-kpi-icon"
              style={
                amber && Number(value) > 0 ? { background: "rgba(245,158,11,0.12)", color: "#D97706" }
                : green ? { background: "var(--green-tint)", color: "var(--green)" }
                : undefined
              }
            >
              <Icon size={20} aria-hidden="true" />
            </div>
            <div className="vac-kpi-info">
              <span className="vac-kpi-label">{label}</span>
              <strong className="vac-kpi-value">{value}</strong>
              {sub && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginTop: 2 }}>{sub}</span>}
            </div>
            <div className="vac-kpi-chevron"><ChevronRight size={16} aria-hidden="true" /></div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="vac-admin-dashboard-new">

      {/* Page header */}
      <header className="admin-page-header">
        <div className="admin-page-header__info">
          <h1>Overview</h1>
          <p>Platform-wide performance and operational status.</p>
        </div>
        <div className="admin-page-header__actions">
          {isContent && <Link href="/admin/products/new" className="btn btn--primary btn--sm">+ New Product</Link>}
          {isOps     && <Link href="/admin/bookings"     className="btn btn--primary btn--sm">Bookings Queue</Link>}
        </div>
      </header>

      {/* Super Admin KPIs */}
      {isSuper && (
        <KpiGrid cards={[
          { icon: TrendingUp, label: "Revenue",   value: `$${revenue.toLocaleString()}`,   href: "/admin/orders",   green: true, sub: "confirmed orders" },
          { icon: Heart,      label: "Donations", value: `$${donations.toLocaleString()}`, href: "/admin/inquiries", green: true, sub: "completed" },
          { icon: UserPlus,   label: "Users",     value: newUsersThisWeek,                 href: "/admin/users",    amber: true, sub: "new this week" },
          { icon: AlertCircle,label: "Pending",   value: pendingTotal,                     href: "/admin/bookings", amber: true, sub: "needs action" },
        ]} />
      )}

      {/* Content KPIs */}
      {isContent && (
        <KpiGrid cards={[
          { icon: Palette,  label: "Products",    value: totalProducts,    href: "/admin/products"                     },
          { icon: Map,      label: "Experiences", value: totalExperiences, href: "/admin/experiences"                  },
          { icon: Leaf,     label: "Campaigns",   value: totalCampaigns,   href: "/admin/conservation", green: true    },
          { icon: Feather,  label: "Posts",       value: totalPosts,       href: "/admin/blog"                         },
          { icon: Sparkles, label: "Talent",      value: totalProfiles,    href: "/admin/talent"                       },
          { icon: Star,     label: "Reviews",     value: pendingReviews,   href: "/admin/reviews",      amber: true    },
        ]} />
      )}

      {/* Ops KPIs */}
      {isOps && (
        <KpiGrid cards={[
          { icon: CalendarCheck, label: "Bookings",     value: pendingBookings,    href: "/admin/bookings",     amber: true },
          { icon: Package,       label: "Orders",       value: pendingOrders,      href: "/admin/orders",       amber: true },
          { icon: FileText,      label: "Applicants",   value: pendingApplications,href: "/admin/applications", amber: true },
          { icon: Mail,          label: "Inquiries",    value: newInquiries,       href: "/admin/inquiries",    amber: true },
        ]} />
      )}

      {/* Recent activity panels */}
      {isOps && (recentOrders.length > 0 || recentBookings.length > 0) && (
        <div className="vac-dashboard-panels-grid" style={{ marginBottom: "var(--space-6)" }}>
          {recentOrders.length > 0 && (
            <section className="admin-card" aria-labelledby="recent-orders-title">
              <div className="admin-card__header">
                <div className="admin-card__header-row">
                  <div><h3 id="recent-orders-title">Recent Orders</h3></div>
                  <Link href="/admin/orders" className="btn btn--ghost btn--sm">View all →</Link>
                </div>
              </div>
              <div className="admin-card__body admin-card__body--flush">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Reference</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {(recentOrders as any[]).map((o: any) => (
                        <tr key={o.id}>
                          <td><span className="td-ref">{o.reference}</span></td>
                          <td><div className="td-sub">{o.user?.email}</div></td>
                          <td><strong>${Number(o.total).toFixed(0)}</strong></td>
                          <td><span className={`chip chip--${o.status === "PENDING" ? "warning" : o.status === "DELIVERED" ? "success" : "neutral"}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {recentBookings.length > 0 && (
            <section className="admin-card" aria-labelledby="recent-bookings-title">
              <div className="admin-card__header">
                <div className="admin-card__header-row">
                  <div><h3 id="recent-bookings-title">Recent Bookings</h3></div>
                  <Link href="/admin/bookings" className="btn btn--ghost btn--sm">View all →</Link>
                </div>
              </div>
              <div className="admin-card__body admin-card__body--flush">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Guest</th><th>Experience</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {(recentBookings as any[]).map((b: any) => (
                        <tr key={b.id}>
                          <td><span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{b.guestName}</span></td>
                          <td><div className="td-sub">{b.experience?.title}</div></td>
                          <td>{new Date(b.preferredDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                          <td><span className={`chip chip--${b.status === "PENDING" ? "warning" : b.status === "CONFIRMED" ? "success" : "danger"}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Attention items: applications + inquiries */}
      {isOps && (recentApplications.length > 0 || recentInquiries.length > 0) && (
        <div className="vac-dashboard-panels-grid" style={{ marginBottom: "var(--space-6)" }}>
          {recentApplications.length > 0 && (
            <section className="admin-card" aria-labelledby="applications-title">
              <div className="admin-card__header">
                <div className="admin-card__header-row">
                  <div><h3 id="applications-title">New Applications</h3></div>
                  <Link href="/admin/applications" className="btn btn--ghost btn--sm">Review →</Link>
                </div>
              </div>
              <div className="admin-card__body admin-card__body--flush">
                <div className="vac-attention-list">
                  {(recentApplications as any[]).map((a: any) => (
                    <Link key={a.id} href={`/admin/applications`} className="vac-attention-item">
                      <span className="vac-attention-title">{a.firstName} {a.lastName} — {a.talentArea.replace(/_/g, " ")}</span>
                      <span className="vac-attention-badge">PENDING</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {recentInquiries.length > 0 && (
            <section className="admin-card" aria-labelledby="inquiries-title">
              <div className="admin-card__header">
                <div className="admin-card__header-row">
                  <div><h3 id="inquiries-title">New Inquiries</h3></div>
                  <Link href="/admin/inquiries" className="btn btn--ghost btn--sm">View →</Link>
                </div>
              </div>
              <div className="admin-card__body admin-card__body--flush">
                <div className="vac-attention-list">
                  {(recentInquiries as any[]).map((i: any) => (
                    <Link key={i.id} href="/admin/inquiries" className="vac-attention-item">
                      <span className="vac-attention-title">{i.name} — {i.subject}</span>
                      <span className="vac-attention-badge">NEW</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Quick actions */}
      <section className="admin-card" aria-labelledby="qa-title">
        <div className="admin-card__header">
          <h3 id="qa-title">Quick Actions</h3>
          <p>Jump to the most common tasks.</p>
        </div>
        <div className="admin-card__body">
          <div className="vac-quick-actions-grid">
            {isContent && <>
              <Link href="/admin/products/new"    className="vac-action-btn"><Palette  size={20} /><span>New Product</span></Link>
              <Link href="/admin/experiences/new" className="vac-action-btn"><Map      size={20} /><span>New Experience</span></Link>
              <Link href="/admin/blog/new"        className="vac-action-btn"><Feather  size={20} /><span>New Blog Post</span></Link>
              <Link href="/admin/conservation/new"className="vac-action-btn"><Leaf     size={20} /><span>New Campaign</span></Link>
            </>}
            {isOps && <>
              <Link href="/admin/slots/new"  className="vac-action-btn"><CalendarCheck size={20} /><span>Add Slot</span></Link>
              <Link href="/admin/orders"     className="vac-action-btn"><Package       size={20} /><span>Process Orders</span></Link>
              <Link href="/admin/bookings"   className="vac-action-btn"><CalendarCheck size={20} /><span>Bookings</span></Link>
            </>}
            {isSuper && <>
              <Link href="/admin/users"    className="vac-action-btn"><FileText size={20} /><span>Manage Users</span></Link>
              <Link href="/admin/settings" className="vac-action-btn"><Mail     size={20} /><span>Settings</span></Link>
            </>}
          </div>
        </div>
      </section>
    </div>
  )
}
