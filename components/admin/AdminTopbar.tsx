"use client"
import { useEffect, useState } from "react"
import { Menu, Sun, Moon, X } from "lucide-react"

export function AdminTopbar() {
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

      <div className="admin-topbar__right">
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
