import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ProfileForm, type ProfileUser } from "./ProfileForm"
import { SignOutButton } from "./SignOutButton"
import { ChangePasswordForm } from "./ChangePasswordForm"
import { DeleteAccountSection } from "./DeleteAccountSection"
import { NotificationsPanel } from "./NotificationsPanel"
import { RemoveSavedButton } from "./RemoveSavedButton"
import { flagEmoji, COUNTRIES } from "@/lib/countries"
import { formatPrice } from "@/lib/utils"
import {
  User, ShoppingBag, CalendarDays, Heart, Bell,
  Shield, Trash2, HeartHandshake,
} from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"

export const dynamic = "force-dynamic"
export const metadata = { title: "My Account | Volcano Arts Center" }

const TABS = [
  { key: "profile",       label: "Profile",        icon: User },
  { key: "orders",        label: "My Orders",      icon: ShoppingBag },
  { key: "bookings",      label: "My Bookings",    icon: CalendarDays },
  { key: "donations",     label: "Donations",      icon: HeartHandshake },
  { key: "saved",         label: "Saved Items",    icon: Heart },
  { key: "notifications", label: "Notifications",  icon: Bell },
  { key: "security",      label: "Security",       icon: Shield },
  { key: "danger",        label: "Danger Zone",    icon: Trash2 },
]

const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--text-muted)", PROCESSING: "#d97706", SHIPPED: "#2563eb",
  DELIVERED: "var(--green)", CANCELLED: "#e53e3e", REFUNDED: "#7c3aed",
  CONFIRMED: "var(--green)", COMPLETED: "var(--green)", REJECTED: "#e53e3e",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard")

  const sp = await searchParams
  const tab = sp.tab ?? "profile"

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { where: { provider: "google" }, select: { id: true } } },
  })
  if (!user) redirect("/login")

  // Fetch tab-specific data
  const [orders, bookings, donations, savedItems, notifications, unreadCount] = await Promise.all([
    tab === "orders"
      ? db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: { include: { product: { select: { name: true } } } } } })
      : [],
    tab === "bookings"
      ? db.booking.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { experience: { select: { title: true } } } })
      : [],
    tab === "donations"
      ? db.donation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { campaign: { select: { name: true } } } })
      : [],
    tab === "saved"
      ? db.savedItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { product: { include: { category: true } } } })
          .then(items => items.map(i => ({ ...i, product: { ...i.product, price: Number(i.product.price), compareAtPrice: i.product.compareAtPrice ? Number(i.product.compareAtPrice) : null, weight: i.product.weight ? Number(i.product.weight) : null } })))
      : [],
    tab === "notifications"
      ? db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 })
      : [],
    db.notification.count({ where: { userId: user.id, read: false } }),
  ])

  const profileUser: ProfileUser = {
    id: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, phone: user.phone, country: user.country,
    profileImageUrl: user.profileImageUrl, image: user.image, name: user.name,
    createdAt: user.createdAt, isGoogleUser: user.accounts.length > 0,
  }

  const avatar = user.profileImageUrl || user.image
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.name || user.email
  const countryCode = COUNTRIES.find(c => c.name === user.country)?.code

  const cardStyle: React.CSSProperties = {
    background: "var(--surface-raised)", border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
  }
  const thStyle: React.CSSProperties = {
    padding: "var(--space-3) var(--space-4)", fontSize: "11px", fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)",
    fontFamily: "var(--font-ui)", textAlign: "left", borderBottom: "2px solid var(--border-subtle)",
  }
  const tdStyle: React.CSSProperties = {
    padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-small)",
    color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)",
  }

  return (
    <div className="client-dashboard-wrap">
      {/* Header */}
      <div className="client-dashboard-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Account</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            My Account
          </h1>
        </div>
      </div>

      <div className="container dashboard-layout">
        {/* Left sidebar */}
        <aside className="dash-sidebar">
          {/* Avatar row */}
          <div className="dash-avatar-row">
            <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "3px solid var(--green)", position: "relative", background: "var(--green-tint)" }}>
              {avatar
                ? <Image src={avatar} alt={displayName} fill unoptimized style={{ objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--green)" }}>{displayName.charAt(0).toUpperCase()}</div>
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              {user.country && countryCode && (
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: 2 }}>{flagEmoji(countryCode)} {user.country}</p>
              )}
            </div>
          </div>

          {/* Tab nav — horizontal scroll on mobile, vertical on desktop */}
          <nav className="dash-tab-nav">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key
              const isDanger = key === "danger"
              return (
                <Link
                  key={key}
                  href={`/client/dashboard?tab=${key}`}
                  className={`dash-tab-link${active ? " dash-tab-link--active" : ""}${isDanger ? " dash-tab-link--danger" : ""}`}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{label}</span>
                  {key === "notifications" && unreadCount > 0 && (
                    <span className="dash-tab-badge">{unreadCount}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="dash-signout">
            <SignOutButton />
          </div>
        </aside>

        {/* Right content */}
        <div>
          {/* PROFILE */}
          {tab === "profile" && <ProfileForm user={profileUser} />}

          {/* ORDERS */}
          {tab === "orders" && (
            <div style={cardStyle}>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>My Orders</h2>
              {orders.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="No orders yet" description="Browse the shop and place your first order." action={{ label: "Browse Shop", href: "/art-store" }} />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Reference", "Date", "Items", "Total", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ ...tdStyle, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)", fontSize: "var(--text-caption)" }}>{o.reference}</td>
                        <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={tdStyle}>{o.items.map(i => i.product.name).join(", ")}</td>
                        <td style={{ ...tdStyle, fontFamily: "var(--font-mono)" }}>{formatPrice(o.total)}</td>
                        <td style={tdStyle}><span style={{ color: STATUS_COLOR[o.status] ?? "var(--text-muted)", fontWeight: 600 }}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* BOOKINGS */}
          {tab === "bookings" && (
            <div style={cardStyle}>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>My Bookings</h2>
              {bookings.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No bookings yet" description="Explore our experiences and book one." action={{ label: "Browse Experiences", href: "/experiences" }} />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Reference", "Experience", "Date", "Group", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ ...tdStyle, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)", fontSize: "var(--text-caption)" }}>{b.reference}</td>
                        <td style={tdStyle}>{b.experience.title}</td>
                        <td style={tdStyle}>{new Date(b.preferredDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={tdStyle}>{b.groupSize} {b.groupSize === 1 ? "person" : "people"}</td>
                        <td style={tdStyle}><span style={{ color: STATUS_COLOR[b.status] ?? "var(--text-muted)", fontWeight: 600 }}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* DONATIONS */}
          {tab === "donations" && (
            <div style={cardStyle}>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>My Donations</h2>
              {donations.length === 0 ? (
                <EmptyState icon={HeartHandshake} title="No donations yet" description="Support a conservation campaign." action={{ label: "Support Now", href: "/conservation" }} />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Reference", "Campaign", "Amount", "Date", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d.id}>
                        <td style={{ ...tdStyle, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)", fontSize: "var(--text-caption)" }}>{d.reference}</td>
                        <td style={tdStyle}>{d.campaign?.name ?? "General"}</td>
                        <td style={{ ...tdStyle, fontFamily: "var(--font-mono)" }}>{formatPrice(d.amount)}</td>
                        <td style={tdStyle}>{new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={tdStyle}><span style={{ color: STATUS_COLOR[d.status] ?? "var(--text-muted)", fontWeight: 600 }}>{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* SAVED ITEMS */}
          {tab === "saved" && (
            <div style={cardStyle}>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>Saved Items</h2>
              {savedItems.length === 0 ? (
                <EmptyState icon={Heart} title="Nothing saved yet" description="Save artworks you love for later." action={{ label: "Browse Shop", href: "/art-store" }} />
              ) : (
                <div className="talent-grid">
                  {savedItems.map(({ product }) => (
                    <div key={product.id} className="card card--interactive" style={{ position: "relative" }}>
                      <Link href={`/art-store/${product.slug}`} className="media media--4x3" style={{ display: "block" }}>
                        {product.primaryImageUrl
                          ? <Image src={product.primaryImageUrl} alt={product.name} fill unoptimized sizes="33vw" style={{ objectFit: "cover" }} />
                          : <div style={{ position: "absolute", inset: 0, background: "var(--green-tint)", display: "grid", placeItems: "center", color: "var(--green-hover)", fontSize: "var(--text-caption)" }}>{product.name}</div>
                        }
                      </Link>
                      <RemoveSavedButton productId={product.id} />
                      <div style={{ padding: "var(--space-3)" }}>
                        <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{product.category?.name}</p>
                        <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{product.name}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--green)", marginTop: "var(--space-1)" }}>{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div style={cardStyle}>
              <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>Notifications</h2>
              <NotificationsPanel notifications={notifications.map(n => ({ ...n, createdAt: n.createdAt }))} />
            </div>
          )}

          {/* SECURITY */}
          {tab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              {profileUser.isGoogleUser ? (
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-3)" }}>Security</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>
                    Password changes are managed through your sign-in provider. Your account security is handled externally.
                  </p>
                </div>
              ) : (
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>Change Password</h2>
                  <ChangePasswordForm />
                </div>
              )}
            </div>
          )}

          {/* DANGER ZONE */}
          {tab === "danger" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div style={cardStyle}>
                <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)", color: "#e53e3e" }}>Danger Zone</h2>
                <DeleteAccountSection />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
