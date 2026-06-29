"use client"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard, Palette, Map, Feather, Star,
  Sparkles, Image, Leaf,
  CalendarCheck, Package, Mail, Users, FileText, Clock, Heart,
  MessageSquare, Bell,
  Shield, Settings, Activity, AlertTriangle, DownloadCloud,
  Globe, LogOut, ChevronLeft, Sun, Moon,
} from "lucide-react"

const CONTENT_LINKS = [
  { href: "/admin/content/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/products",          label: "Art Catalog",    icon: Palette },
  { href: "/admin/experiences",       label: "Experiences",    icon: Map },
  { href: "/admin/blog",              label: "Blog Posts",     icon: Feather },
  { href: "/admin/reviews",           label: "Reviews",        icon: Star },
  { href: "/admin/talent",            label: "Talent Profiles",icon: Sparkles },
  { href: "/admin/content/media",     label: "Media Library",  icon: Image },
  { href: "/admin/conservation",      label: "Campaigns",      icon: Leaf },
]

const OPS_LINKS = [
  { href: "/admin",             label: "Dashboard",          icon: LayoutDashboard },
  { href: "/admin/bookings",    label: "Bookings",          icon: CalendarCheck },
  { href: "/admin/orders",      label: "Shipping Orders",   icon: Package },
  { href: "/admin/inquiries",   label: "Contact Inquiries", icon: Mail },
  { href: "/admin/operators",   label: "Tour Operators",    icon: Users },
  { href: "/admin/applications",label: "Talent Applications",icon: FileText },
  { href: "/admin/slots",       label: "Availability Slots",icon: Clock },
]

const SUPER_LINKS = [
  { href: "/admin",          label: "Main Dashboard",    icon: LayoutDashboard },
  { href: "/admin/users",    label: "Staff & Accounts",  icon: Shield },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/audit",    label: "Audit Log",         icon: Activity },
  { href: "/admin/overrides",label: "Overrides & Refunds",icon: AlertTriangle },
  { href: "/admin/export",   label: "Export Data",       icon: DownloadCloud },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as string | undefined

  const isContent = role === "CONTENT_MANAGER" || role === "SUPER_ADMIN"
  const isOps     = role === "OPS_MANAGER"     || role === "SUPER_ADMIN"
  const isSuper   = role === "SUPER_ADMIN"

  // Theme toggle stored in sidebar footer
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vac-theme")
      if (saved) document.documentElement.setAttribute("data-theme", saved)
    } catch (_) {}
  }, [])

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme")
    const next = current === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", next)
    try { localStorage.setItem("vac-theme", next) } catch (_) {}
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  function NavGroup({ title, links }: { title: string; links: typeof CONTENT_LINKS }) {
    return (
      <div className="admin-sidebar__section">
        <span className="admin-sidebar__section-label">{title}</span>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`admin-sidebar__link${isActive(href) ? " active" : ""}`}
            aria-label={label}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <aside className="admin-sidebar" id="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar__header">
        <Link href="/" className="admin-sidebar__logo" aria-label="Volcano Arts Center">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="18" fill="#00A651" />
            <path d="M9 28L18 10L27 28" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 23L23 23" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="admin-sidebar__logo-name">VOLCANO ARTS</span>
        </Link>
        <button
          className="admin-sidebar__close"
          id="sidebar-close"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          style={{ display: "grid", placeItems: "center" }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin sections">
        {isContent && <NavGroup title="Content"    links={CONTENT_LINKS} />}
        {isOps     && <NavGroup title="Operations" links={OPS_LINKS}     />}
        {isSuper   && <NavGroup title="Administration" links={SUPER_LINKS} />}
      </nav>

      <div className="admin-sidebar__footer">
        <button
          className="admin-sidebar__link admin-sidebar__footer-link"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{ border: "none", width: "100%", cursor: "pointer", background: "transparent" }}
        >
          <Sun size={16} className="theme-icon-light" aria-hidden="true" />
          <Moon size={16} className="theme-icon-dark" aria-hidden="true" />
          <span>Toggle Theme</span>
        </button>

        <Link href="/" className="admin-sidebar__link admin-sidebar__footer-link" target="_blank" rel="noopener noreferrer" aria-label="View public site">
          <Globe size={16} aria-hidden="true" />
          <span>View Site</span>
        </Link>

        <button
          className="admin-sidebar__link admin-sidebar__link--logout"
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ border: "none", width: "100%", cursor: "pointer", background: "transparent" }}
          aria-label="Sign out"
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
