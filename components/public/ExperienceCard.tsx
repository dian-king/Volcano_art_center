import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { MotionCard } from "./MotionCard"

interface ExperienceCardProps {
  experience: {
    id: string
    title: string
    slug: string
    shortDescription: string | null
    location: string | null
    durationHours: string | number | { toString: () => string } | null
    pricePerPerson: string | number | { toString: () => string } | null
    experienceType: string
    primaryImageUrl: string | null
    featured: boolean
  }
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <MotionCard className="exp-card card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
      <Link href={`/experiences/${experience.slug}`} className="exp-card__media media">
        {experience.primaryImageUrl ? (
          <Image
            src={experience.primaryImageUrl}
            alt={experience.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "var(--green-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-hover)", fontSize: "var(--text-caption)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {experience.title}
          </div>
        )}
        <span className="chip chip--accent">{experience.experienceType}</span>
        {experience.durationHours && (
          <em>{String(experience.durationHours)}h</em>
        )}
      </Link>
      <div className="exp-card__body">
        {experience.location && <p className="exp-card__loc">📍 {experience.location}</p>}
        <h3><Link href={`/experiences/${experience.slug}`}>{experience.title}</Link></h3>
        {experience.shortDescription && <p className="exp-card__desc">{experience.shortDescription}</p>}
        <div className="exp-card__foot">
          {experience.pricePerPerson != null && (
            <div>
              <strong>{formatPrice(String(experience.pricePerPerson))}</strong>
              <small> / person</small>
            </div>
          )}
          <Link href={`/experiences/${experience.slug}`} className="btn btn--primary btn--sm">Book Now</Link>
        </div>
      </div>
    </MotionCard>
  )
}