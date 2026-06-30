"use client"

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
  MessageSquare,
  PlusCircle,
  Shield,
  ShoppingBag,
  Trash2,
  User,
  UserCircle,
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

  return (
    <div className="app-dashboard">
      <aside className="app-dashboard__sidebar">
        <div className="app-dashboard__sidebar-header">
          <Link href={homeHref} className="app-dashboard__brand" aria-label="Volcano Arts Center">
            <img src="/images/logo.png" alt="Volcano Arts Center" style={{ height: 44, width: "auto", display: "block" }} />
          </Link>
        </div>

        <div className="app-dashboard__identity">
          <div className="app-dashboard__avatar">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill unoptimized sizes="44px" style={{ objectFit: "cover" }} />
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
          <Link href="/" className="app-dashboard__footer-link" target="_blank" rel="noopener noreferrer" aria-label="View public site">
            <Globe size={16} aria-hidden="true" />
            <span>View Site</span>
          </Link>
          {signOut}
        </div>
      </aside>

      <div className="app-dashboard__main">
        <header className="app-dashboard__topbar">
          <div>
            <span className="eyebrow">{title}</span>
            {subtitle && <p>{subtitle}</p>}
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
                    <Image src={user.image} alt={user.name} fill unoptimized sizes="32px" style={{ objectFit: "cover" }} />
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
