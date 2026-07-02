"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Globe,
  Heart,
  HeartHandshake,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  PlusCircle,
  Shield,
  ShoppingBag,
  Sun,
  Trash2,
  User,
  UserCircle,
  X,
} from "lucide-react"

const icons = {
  bell: Bell,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  fileText: FileText,
  heart: Heart,
  heartHandshake: HeartHandshake,
  layoutDashboard: LayoutDashboard,
  message: MessageSquare,
  plusCircle: PlusCircle,
  shield: Shield,
  shoppingBag: ShoppingBag,
  trash: Trash2,
  user: User,
}

type DashboardNavItem = {
  href: string
  label: string
  icon: keyof typeof icons
  badge?: number
  exact?: boolean
  danger?: boolean
}

type DashboardShellProps = {
  title: string
  subtitle?: string
  homeHref?: string
  profileHref?: string
  notificationHref: string
  unread?: number
  user: {
    name: string
    email?: string | null
    image?: string | null
    roleLabel?: string
  }
  nav: DashboardNavItem[]
  actions?: React.ReactNode
  signOut?: React.ReactNode
  children: React.ReactNode
}

export function DashboardShell({
  title,
  subtitle,
  homeHref = "/",
  profileHref,
  notificationHref,
  unread = 0,
  user,
  nav,
  actions,
  signOut,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Auto-close the drawer whenever navigation happens
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Restore saved theme (shared "vac-theme" key with the public site & admin panel)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vac-theme") as "light" | "dark" | null
      if (saved) setTheme(saved)
    } catch (_) {}
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    try { localStorage.setItem("vac-theme", next) } catch (_) {}
  }

  return (
    <div className="app-dashboard">
      {mobileOpen && (
        <div className="app-dashboard__backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
      <aside className={`app-dashboard__sidebar${mobileOpen ? " app-dashboard__sidebar--open" : ""}`}>
        <div className="app-dashboard__sidebar-header">
          <Link href={homeHref} className="app-dashboard__brand" aria-label="Volcano Arts Center">
            <img src="/images/logo.png" alt="Volcano Arts Center" style={{ height: 44, width: "auto", display: "block" }} />
          </Link>
          <button
            className="app-dashboard__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-dashboard__identity">
          <div className="app-dashboard__avatar">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill sizes="44px" style={{ objectFit: "cover" }} />
            ) : (
              <UserCircle size={26} />
            )}
          </div>
          <div className="app-dashboard__identity-text">
            <p>{user.name}</p>
            {user.email && <span>{user.email}</span>}
            {user.roleLabel && <small>{user.roleLabel}</small>}
          </div>
        </div>

        <nav className="app-dashboard__nav" aria-label={`${title} navigation`}>
          {nav.map(({ href, label, icon, badge, exact, danger }) => {
            const Icon = icons[icon]
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`app-dashboard__nav-link${active ? " app-dashboard__nav-link--active" : ""}${danger ? " app-dashboard__nav-link--danger" : ""}`}
              >
                <Icon size={17} />
                <span>{label}</span>
                {badge ? <strong>{badge > 9 ? "9+" : badge}</strong> : null}
              </Link>
            )
          })}
        </nav>

        <div className="app-dashboard__sidebar-footer">
          <button
            className="app-dashboard__footer-link"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <Link href="/" className="app-dashboard__footer-link" target="_blank" rel="noopener noreferrer" aria-label="View public site">
            <Globe size={16} aria-hidden="true" />
            <span>View Site</span>
          </Link>
          {signOut}
        </div>
      </aside>

      <div className="app-dashboard__main">
        <header className="app-dashboard__topbar">
          <div className="app-dashboard__topbar-left">
            <button
              className="app-dashboard__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
            <div>
              <span className="eyebrow">{title}</span>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <div className="app-dashboard__topbar-actions">
            {actions}
            <Link href={notificationHref} className="app-dashboard__icon-btn" aria-label={unread ? `${unread} unread notifications` : "Notifications"}>
              <Bell size={19} />
              {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
            </Link>
            {profileHref && (
              <Link href={profileHref} className="app-dashboard__profile-chip">
                <div className="app-dashboard__profile-mini">
                  {user.image ? (
                    <Image src={user.image} alt={user.name} fill sizes="32px" style={{ objectFit: "cover" }} />
                  ) : (
                    <UserCircle size={20} />
                  )}
                </div>
                <span>{user.name}</span>
              </Link>
            )}
          </div>
        </header>

        <main className="app-dashboard__content">
          {children}
        </main>
      </div>
    </div>
  )
}
