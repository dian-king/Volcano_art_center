"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MessageCircle, ShoppingBag, Sun, Moon, ChevronDown, User, LogIn } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Shop", href: "/art-store",
    mega: {
      menu: [
        { label: "All Artworks", href: "/art-store" },
        { label: "Paintings", href: "/art-store?category=paintings" },
        { label: "Sculpture", href: "/art-store?category=sculpture" },
        { label: "Textiles", href: "/art-store?category=textiles" },
        { label: "Photography", href: "/art-store?category=photography" },
      ],
      features: [
        { label: "Paintings", href: "/art-store?category=paintings", img: "/images/WhatsApp Image 2026-06-27 at 1.59.54 PM.jpeg" },
        { label: "Textiles & Crafts", href: "/art-store?category=textiles", img: "/images/WhatsApp Image 2026-06-27 at 1.59.53 PM (1).jpeg" },
        { label: "Sculptures", href: "/art-store?category=sculpture", img: "/images/gorilla-sculpture.jpeg" },
      ],
    },
  },
  {
    label: "Experiences", href: "/experiences",
    mega: {
      menu: [
        { label: "All Experiences", href: "/experiences" },
        { label: "Cultural & Community", href: "/experiences?category=cultural-community-experiences" },
        { label: "Arts & Creative", href: "/experiences?category=arts-creative-experiences" },
        { label: "Outdoor & Adventure", href: "/experiences?category=outdoor-adventure-activities" },
        { label: "Tours & Excursions", href: "/experiences?category=tours-excursions" },
      ],
      features: [
        { label: "Heritage Immersion", href: "/experiences/traditional-rwandan-heritage-immersion", img: "/images/WhatsApp Image 2026-06-27 at 1.59.58 PM.jpeg" },
        { label: "Painting Workshop", href: "/experiences?category=arts-creative-experiences", img: "/images/WhatsApp Image 2026-06-27 at 1.59.57 PM.jpeg" },
        { label: "Village Life", href: "/experiences?category=local-lifestyle-experiences", img: "/images/WhatsApp Image 2026-06-27 at 1.59.58 PM (2).jpeg" },
      ],
    },
  },
  {
    label: "Conservation", href: "/conservation",
    mega: {
      menu: [
        { label: "Our Impact", href: "/conservation" },
        { label: "Gorilla Habitat Fund", href: "/conservation/gorilla-habitat-restoration-fund" },
        { label: "Community Education", href: "/conservation/community-education-fund" },
        { label: "Donate Now", href: "/conservation#donate" },
      ],
      features: [
        { label: "Gorilla Habitat Fund", href: "/conservation/gorilla-habitat-restoration-fund", img: "/images/WhatsApp Image 2026-06-27 at 1.59.55 PM (1).jpeg" },
        { label: "Virunga Reforestation", href: "/conservation/virunga-reforestation-2025", img: "/images/WhatsApp Image 2026-06-27 at 1.59.54 PM (2).jpeg" },
        { label: "Support Us", href: "/conservation", img: "/images/talent-highlands-man.jpeg" },
      ],
    },
  },
  {
    label: "Blog & Stories", href: "/blog",
    mega: {
      menu: [
        { label: "Latest Stories", href: "/blog" },
        { label: "Artist Stories", href: "/blog?category=STORY" },
        { label: "Culture", href: "/blog?category=CULTURE" },
        { label: "Conservation Updates", href: "/blog?category=CONSERVATION" },
      ],
      features: [
        { label: "Artist Stories", href: "/blog?category=STORY", img: "/images/WhatsApp Image 2026-06-27 at 1.59.54 PM (1).jpeg" },
        { label: "Conservation", href: "/blog?category=CONSERVATION", img: "/images/WhatsApp Image 2026-06-27 at 1.59.55 PM (1).jpeg" },
        { label: "Culture & Heritage", href: "/blog?category=CULTURE", img: "/images/WhatsApp Image 2026-06-27 at 1.59.53 PM (1).jpeg" },
      ],
    },
  },
  {
    label: "Talent", href: "/talent",
    mega: {
      menu: [
        { label: "Talent Pipeline", href: "/talent" },
        { label: "Artists", href: "/talent#profiles" },
        { label: "Apply to Programme", href: "/talent/apply" },
      ],
      features: [
        { label: "Meet Our Artists", href: "/talent", img: "/images/WhatsApp Image 2026-06-27 at 1.59.54 PM (1).jpeg" },
        { label: "Apply Now", href: "/talent/apply", img: "/images/WhatsApp Image 2026-06-27 at 1.59.58 PM (1).jpeg" },
        { label: "Live Painting", href: "/experiences/live-painting-workshop-vac", img: "/images/talent-gorilla-sketch.jpeg" },
      ],
    },
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Tour Operators", href: "/tour-operators/apply" },
]

export function PublicNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { count, setOpen, loadFromStorage } = useCartStore()
  const router = useRouter()
  const isHome = pathname === "/"
  const [scrolled, setScrolled] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [openMega, setOpenMega] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => { loadFromStorage() }, [loadFromStorage])
  useEffect(() => {
    try { setTheme((localStorage.getItem("vac-theme") as "light" | "dark") ?? "light") } catch {}
  }, [])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("vac-theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }

  const navClass = ["site-nav", isHome && !scrolled ? "transparent" : ""].filter(Boolean).join(" ")

  return (
    <nav className={navClass} id="main-nav" aria-label="Primary">
      <div className="site-nav__inner">
        {/* Logo */}
        <Link className="site-nav__logo" href="/" aria-label="Volcano Arts Center Inc Rwanda — home">
          <Image src="/images/logo.png" alt="Volcano Arts Center Inc Rwanda" width={79} height={44} priority style={{ height: 44, width: "auto", display: "block" }} />
        </Link>

        {/* Nav links */}
        <ul className={`nav-links${navOpen ? " open" : ""}`} id="nav-links">
          <li><Link className={`nav-link${pathname === "/" ? " active" : ""}`} href="/">Home</Link></li>

          {NAV_ITEMS.filter(i => i.mega).map(item => (
            <li
              key={item.label}
              className={`nav-item nav-item--mega${openMega === item.label ? " is-open" : ""}`}
              onMouseEnter={() => setOpenMega(item.label)}
              onMouseLeave={() => setOpenMega(null)}
            >
              <div className="nav-item__trigger">
                <Link className={`nav-link${pathname.startsWith(item.href) ? " active" : ""}`} href={item.href}>
                  {item.label}
                </Link>
                <button
                  type="button"
                  className="nav-mega__mobile-toggle"
                  aria-label={`Toggle ${item.label} menu`}
                  aria-expanded={openMega === item.label}
                  aria-controls={`nav-mega-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setOpenMega(p => p === item.label ? null : item.label)}
                >
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="nav-mega" id={`nav-mega-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="nav-mega__panel">
                  <div className="nav-mega__menu">
                    <span className="nav-mega__menu-title">{item.label}</span>
                    {item.mega!.menu.map(link => (
                      <Link key={link.label} className="nav-mega__menu-link" href={link.href} onClick={() => setNavOpen(false)}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="nav-mega__feature-rail">
                    {item.mega!.features.map((f, i) => (
                      <Link key={`${f.label}-${i}`} className="nav-mega__feature-card" href={f.href} onClick={() => setNavOpen(false)}>
                        <div className="nav-mega__feature-media">
                          {(f as { img?: string }).img && (
                            <img
                              src={(f as { img?: string }).img}
                              alt={f.label}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <span className="nav-mega__feature-label">{f.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}

          {NAV_ITEMS.filter(i => !i.mega && i.href !== "/").map(item => (
            <li key={item.label}>
              <Link className={`nav-link${pathname.startsWith(item.href) ? " active" : ""}`} href={item.href} onClick={() => setNavOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right action cluster */}
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link href="/contact#live-chat" className="icon-btn" aria-label="Live chat">
            <MessageCircle size={18} />
          </Link>
          {session?.user ? (() => {
            const href = ["SUPER_ADMIN", "CONTENT_MANAGER", "OPS_MANAGER"].includes(session.user.role as string)
              ? "/admin"
              : session.user.role === "TALENT_APPLICANT"
              ? "/talent/dashboard"
              : session.user.role === "TOUR_OPERATOR"
              ? "/tour-operators/portal"
              : "/client/dashboard/profile"
            const label = ["SUPER_ADMIN", "CONTENT_MANAGER", "OPS_MANAGER"].includes(session.user.role as string)
              ? "Admin Panel"
              : session.user.role === "TOUR_OPERATOR"
              ? "Operator Portal"
              : session.user.role === "REGISTERED_CLIENT"
              ? "My Account"
              : "Dashboard"
            return <>
              {/* Desktop: text button */}
              <Link href={href} className="btn-auth nav-auth--desktop">{label}</Link>
              {/* Mobile: icon only */}
              <Link href={href} className="icon-btn nav-auth--mobile" aria-label={label}>
                <User size={18} />
              </Link>
            </>
          })() : <>
            <Link href="/login" className="btn-auth btn-auth--ghost nav-auth--desktop">Sign In</Link>
            <Link href="/login" className="icon-btn nav-auth--mobile" aria-label="Sign in">
              <LogIn size={18} />
            </Link>
          </>}
          {!["SUPER_ADMIN", "CONTENT_MANAGER", "OPS_MANAGER"].includes(session?.user?.role as string ?? "") && (
            <button
              className="icon-btn"
              aria-label={`Shopping cart (${count} items)`}
              data-cart-open
              onClick={() => session?.user ? setOpen(true) : router.push(`/login?next=${encodeURIComponent(pathname)}`)}
            >
              <ShoppingBag size={20} />
              {count > 0 && <span className="nav-badge" aria-hidden="true">{count}</span>}
            </button>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`nav-toggle${navOpen ? " active" : ""}`}
          id="nav-toggle"
          aria-label="Toggle navigation"
          aria-controls="nav-links"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
