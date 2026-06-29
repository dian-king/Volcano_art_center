import { PlusCircle, Compass, PenTool, Star, Sparkles, Globe } from "lucide-react"

const ACTIONS = [
  { icon: <PlusCircle size={22} />, label: "Add Product", href: "/admin/products/new", external: false },
  { icon: <Compass size={22} />, label: "Add Experience", href: "/admin/experiences/new", external: false },
  { icon: <PenTool size={22} />, label: "New Blog Post", href: "/admin/blog/new", external: false },
  { icon: <Star size={22} />, label: "Moderate Reviews", href: "/admin/reviews", external: false },
  { icon: <Sparkles size={22} />, label: "Talent Showcase", href: "/admin/talent", external: false },
  { icon: <Globe size={22} />, label: "View Public Site", href: "/", external: true },
]

export function ContentQuickActions() {
  return (
    <section className="admin-card" aria-labelledby="qa-title">
      <div className="admin-card__header">
        <h3 id="qa-title">Quick Actions</h3>
        <p>Jump directly to content tasks.</p>
      </div>
      <div className="admin-card__body">
        <div className="vac-quick-actions-grid">
          {ACTIONS.map(({ icon, label, href, external }) => (
            <a
              key={label}
              className="vac-action-btn"
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {icon}
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
