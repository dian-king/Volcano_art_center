"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, Sun, Moon, X, Bell, Search, Plus } from "lucide-react"

export function AdminTopbar({
  unread = 0,
  user,
}: {
  unread?: number
  user?: { name: string; email?: string | null; image?: string | null; role?: string }
}) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vac-theme") as "light" | "dark" | null
      if (saved) setTheme(saved)
    } catch (_) {}
  }, [])

  function toggleSidebar() {
    const sidebar = document.querySelector(".admin-sidebar")
    const body = document.querySelector(".admin-body")
    if (!sidebar || !body) return
    const next = !open
    setOpen(next)
    sidebar.classList.toggle("mobile-open", next)
    body.classList.toggle("admin-mobile-nav-open", next)
    document.body.style.overflow = next ? "hidden" : ""
  }

  function closeSidebar() {
    const sidebar = document.querySelector(".admin-sidebar")
    const body = document.querySelector(".admin-body")
    sidebar?.classList.remove("mobile-open")
    body?.classList.remove("admin-mobile-nav-open")
    document.body.style.overflow = ""
    setOpen(false)
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    try { localStorage.setItem("vac-theme", next) } catch (_) {}
  }

  // Close sidebar on backdrop click (the backdrop is in the DOM from CSS)
  useEffect(() => {
    const backdrop = document.querySelector(".admin-sidebar-backdrop")
    backdrop?.addEventListener("click", closeSidebar)
    return () => backdrop?.removeEventListener("click", closeSidebar)
  }, [])

  return (
    <header className="admin-topbar" role="banner">
      {/* Hamburger — only visible on mobile (<768px) */}
      <div className="admin-topbar__left">
        <button
          className="admin-topbar__toggle"
          onClick={open ? closeSidebar : toggleSidebar}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>
          Admin
        </span>
      </div>

      <form action="/admin/products" className="admin-topbar__search">
        <Search size={16} />
        <input name="q" placeholder="Search products, bookings, content..." />
      </form>

      <div className="admin-topbar__right">
        <Link className="btn btn--primary btn--sm admin-topbar__new" href="/admin/experiences/new">
          <Plus size={16} />
          New
        </Link>
        <Link
          className="icon-btn"
          href="/admin/inquiries"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
          style={{ position: "relative" }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: "999px", background: "var(--green)", color: "#fff", fontSize: 10, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        {user && (
          <div className="admin-topbar__user" title={user.email ?? user.name}>
            <div className="admin-topbar__avatar">
              {user.image ? <img src={user.image} alt={user.name} /> : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="admin-topbar__user-info">
              <span className="admin-topbar__user-name">{user.name}</span>
              <span className="admin-topbar__user-role">{user.role?.replaceAll("_", " ")}</span>
            </div>
          </div>
        )}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
