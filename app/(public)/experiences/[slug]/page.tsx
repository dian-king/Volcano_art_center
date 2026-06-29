import { db } from "@/lib/db"
import { ReviewCard } from "@/components/public/ReviewCard"
import { ExperienceTabs } from "@/components/public/ExperienceTabs"
import { formatPrice, formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AuthGuardButton } from "@/components/public/AuthGuardButton"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const exp = await db.experience.findUnique({ where: { slug } })
  if (!exp) return {}
  return { title: exp.title, description: exp.shortDescription ?? exp.title }
}

const TYPE_LABEL: Record<string, string> = {
  CULTURAL: "Cultural", VILLAGE: "Village Life", CONSERVATION: "Conservation", CUSTOM: "Custom"
}

const SLOT_COLOR: Record<string, string> = {
  AVAILABLE: "var(--color-success)", LIMITED: "var(--color-warning)",
  FULLY_BOOKED: "var(--color-error)", BLACKOUT: "var(--text-muted)", REQUEST_ONLY: "var(--color-info)",
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const experience = await db.experience.findUnique({
    where: { slug },
    include: {
      reviews: { where: { approved: true } },
      slots: { where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 30 },
    },
  })
  if (!experience || experience.status !== "PUBLISHED") notFound()

  const price = experience.pricePerPerson ? Number(experience.pricePerPerson) : null
  const groupPrice = experience.groupPrice ? Number(experience.groupPrice) : null
  const duration = experience.durationHours ? Number(experience.durationHours) : null

  const section = (title: string, items: string[], color?: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", color: "var(--text-primary)" }}>{title}</h3>
      <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {items.map(i => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", fontSize: "var(--text-small)", color: color ?? "var(--text-secondary)" }}>
            <span style={{ color: color ?? "var(--green)", marginTop: 2, flexShrink: 0 }}>{color === "var(--color-error)" ? "✗" : "✓"}</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>

      {/* Hero image */}
      <div style={{ position: "relative", height: "clamp(280px, 45vh, 480px)", background: "var(--green-deep)", overflow: "hidden" }}>
        {experience.primaryImageUrl ? (
          <Image src={experience.primaryImageUrl} alt={experience.title} fill unoptimized style={{ objectFit: "cover", opacity: 0.75 }} sizes="100vw" />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--green-deep) 0%, #1B4332 100%)" }} />
        )}
        {/* Overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }} />
        {/* Hero text */}
        <div className="container" style={{ position: "absolute", bottom: "var(--space-7)", left: "50%", transform: "translateX(-50%)", width: "100%" }}>
          <span className="chip chip--accent" style={{ marginBottom: "var(--space-3)" }}>
            {TYPE_LABEL[experience.experienceType] ?? experience.experienceType}
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
            {experience.title}
          </h1>
          <div style={{ display: "flex", gap: "var(--space-5)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
            {experience.location && <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--text-small)", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>📍 {experience.location}</span>}
            {duration && <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--text-small)" }}>⏱ {duration}h</span>}
            {experience.languages.length > 0 && <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--text-small)" }}>🗣 {experience.languages.join(", ")}</span>}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: "var(--space-5)", paddingBottom: "var(--space-2)" }}>
        <nav style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", alignItems: "center" }}>
          <Link href="/experiences" style={{ color: "var(--text-muted)" }}>Experiences</Link>
          <span>›</span>
          <span style={{ color: "var(--text-primary)" }}>{experience.title}</span>
        </nav>
      </div>

      {/* Body */}
      <div className="container" style={{ paddingBlock: "var(--space-7)", display: "grid", gridTemplateColumns: "1fr 360px", gap: "var(--space-9)", alignItems: "start" }}>

        {/* Left: tabbed content */}
        <ExperienceTabs
          overview={
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
              {experience.shortDescription && (
                <p style={{ fontSize: "var(--text-lead)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {experience.shortDescription}
                </p>
              )}
              {experience.description && (
                <p style={{ fontSize: "var(--text-body)", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {experience.description}
                </p>
              )}
              {experience.meetingPoint && (
                <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span style={{ fontSize: "1.2rem" }}>📍</span>
                  <div>
                    <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-caption)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Meeting Point</p>
                    <p style={{ fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{experience.meetingPoint}</p>
                  </div>
                </div>
              )}
              {experience.slots.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", marginBottom: "var(--space-4)" }}>Available Dates</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                    {experience.slots.map((slot) => (
                      <span key={slot.id} style={{
                        padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)",
                        background: "var(--surface-raised)", border: `1.5px solid ${SLOT_COLOR[slot.status] ?? "var(--border-subtle)"}`,
                        fontSize: "var(--text-caption)", color: SLOT_COLOR[slot.status] ?? "var(--text-primary)",
                        fontFamily: "var(--font-ui)",
                      }}>
                        {formatDate(slot.date)}
                        {slot.status === "AVAILABLE" && slot.capacity - slot.booked > 0 && ` · ${slot.capacity - slot.booked} spots`}
                        {slot.status !== "AVAILABLE" && ` · ${slot.status.replace("_", " ")}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
          inclusions={
            <div className="stat-pair">
              {experience.included.length > 0 && section("What's Included", experience.included)}
              {experience.excluded.length > 0 && section("Not Included", experience.excluded, "var(--color-error)")}
              {experience.whatToBring.length > 0 && section("What to Bring", experience.whatToBring, "var(--color-info)")}
            </div>
          }
          reviews={
            experience.reviews.length > 0 ? (
              <div>
                <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", marginBottom: "var(--space-5)" }}>Guest Reviews</h3>
                <div className="review-grid">
                  {experience.reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-body)" }}>No reviews yet.</p>
            )
          }
        />

        {/* Right: sticky booking card */}
        <div style={{ position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
          <div className="card" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Book This Experience</h3>

            {price != null && (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-headline)", fontWeight: 700, color: "var(--green)" }}>
                    {formatPrice(price)}
                  </span>
                  <span style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>per person</span>
                </div>
                {groupPrice != null && (
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                    Group rate: {formatPrice(groupPrice)}/person
                  </p>
                )}
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {[
                ["Group size", `${experience.minGroupSize}–${experience.maxGroupSize} people`],
                ...(duration ? [["Duration", `${duration} hours`]] : []),
                ...(experience.bookingType === "INQUIRY" ? [["Booking", "By enquiry"]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)" }}>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>{k}</span>
                  <span style={{ color: "var(--text-primary)" }}>{v}</span>
                </div>
              ))}
            </div>

            <AuthGuardButton
              href={`/contact?subject=Booking: ${encodeURIComponent(experience.title)}`}
              className="btn btn--primary"
              style={{ textAlign: "center", width: "100%", justifyContent: "center", display: "flex" }}
            >
              {experience.bookingType === "INQUIRY" ? "Request a Quote" : "Book Now"}
            </AuthGuardButton>

            <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", textAlign: "center", fontFamily: "var(--font-ui)" }}>
              Free cancellation up to 48h before
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
