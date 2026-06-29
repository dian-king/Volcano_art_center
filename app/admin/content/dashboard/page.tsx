import { getContentDashboardData } from "@/lib/content-dashboard"
import { RecentContentTable } from "@/components/admin/RecentContentTable"
import { ContentActivityTimeline } from "@/components/admin/ContentActivityTimeline"
import { ContentQuickActions } from "@/components/admin/ContentQuickActions"
import { ContentAttentionList } from "@/components/admin/ContentAttentionList"
import { ContentCharts } from "@/components/admin/ContentCharts"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Palette, Eye, FileEdit, Map, Feather, Star, Sparkles, Image, ChevronRight, PlusCircle, PenTool } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Content Dashboard | Volcano Arts Admin",
  description: "Manage the art catalog, experiences, blog posts, reviews, and talent showcase.",
  robots: { index: false, follow: false },
}

export const revalidate = 60

export default async function ContentDashboardPage() {
  const session = await auth()
  if (!session?.user || !["CONTENT_MANAGER", "SUPER_ADMIN"].includes(session.user.role as string)) {
    redirect("/")
  }

  const data = await getContentDashboardData()
  const { kpis, recentlyUpdatedContent, recentActivity } = data

  const KPI_CARDS = [
    { icon: <Palette size={20} />, label: "Art Products", value: kpis.totalProducts, href: "/admin/products", alert: false },
    { icon: <Eye size={20} />, label: "Published", value: kpis.publishedProducts, href: "/admin/products", alert: false },
    { icon: <FileEdit size={20} />, label: "Drafts", value: kpis.draftProducts, href: "/admin/products", alert: false },
    { icon: <Map size={20} />, label: "Experiences", value: kpis.totalExperiences, href: "/admin/experiences", alert: false },
    { icon: <Feather size={20} />, label: "Blog Posts", value: kpis.totalBlogPosts, href: "/admin/blog", alert: false },
    { icon: <Star size={20} />, label: "Pending Reviews", value: kpis.pendingReviews, href: "/admin/reviews", alert: kpis.pendingReviews > 0 },
    { icon: <Sparkles size={20} />, label: "Talent Profiles", value: kpis.publishedTalentProfiles, href: "/admin/talent", alert: false },
    { icon: <Image size={20} />, label: "Media Library", value: "→", href: "/admin/content/media", alert: false },
    // ponytail: media count is filesystem-based, shown as → since no DB model
  ]

  return (
    <div className="vac-admin-dashboard-new">
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-4)" }}>
        <Link href="/admin" style={{ color: "var(--text-muted)" }}>Admin</Link>
        <span>›</span>
        <span>Content</span>
        <span>›</span>
        <span style={{ color: "var(--text-primary)" }} aria-current="page">Dashboard</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <div className="admin-page-header__info">
          <h1>Content Overview</h1>
          <p>Manage the art catalog, experiences, blog, and more.</p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/products/new" className="btn btn--secondary btn--sm" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <PlusCircle size={14} /> Add Product
          </Link>
          <Link href="/admin/blog/new" className="btn btn--primary btn--sm" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <PenTool size={14} /> New Post
          </Link>
        </div>
      </header>

      {/* KPI grid */}
      <div className="vac-dashboard-kpi-grid">
        {KPI_CARDS.map(({ icon, label, value, href, alert }) => (
          <a key={label} className="vac-dashboard-kpi-card" href={href}>
            <div className="vac-kpi-icon" style={alert ? { background: "rgba(245,158,11,0.12)", color: "#F59E0B" } : undefined}>
              {icon}
            </div>
            <div className="vac-kpi-info">
              <span className="vac-kpi-label">{label}</span>
              <strong className="vac-kpi-value">{value}</strong>
            </div>
            <div className="vac-kpi-chevron"><ChevronRight size={16} /></div>
          </a>
        ))}
      </div>

      {/* Charts */}
      <section style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
          Analytics
        </h2>
        <ContentCharts
          productsByStatus={data.charts.productsByStatus}
          blogByCategory={data.charts.blogByCategory}
          recentPublished={data.charts.recentPublished}
        />
      </section>

      {/* Panels */}
      <div className="vac-dashboard-panels-grid">
        <div className="vac-panels-col">
          <RecentContentTable items={recentlyUpdatedContent} />
          <ContentActivityTimeline logs={recentActivity} />
        </div>
        <div className="vac-panels-col">
          <ContentQuickActions />
          <ContentAttentionList kpis={kpis} />
        </div>
      </div>
    </div>
  )
}
