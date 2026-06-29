"use client"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = localStorage.getItem("vac-theme") as "light" | "dark" | null
    if (saved) setTheme(saved)
  }, [])

  function toggle() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("vac-theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }

  return (
    <button className="nav-btn theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}