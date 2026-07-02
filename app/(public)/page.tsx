import { db } from "@/lib/db"
import { ProductCard } from "@/components/public/ProductCard"
import { ExperienceCard } from "@/components/public/ExperienceCard"
import { StoryCard } from "@/components/public/StoryCard"
import { ReviewCard } from "@/components/public/ReviewCard"
import { ReviewForm } from "@/components/public/ReviewForm"
import { HeroSection } from "@/components/public/HeroSection"
import { PolaroidStack } from "@/components/public/PolaroidStack"
import { RevealSection } from "@/components/ui/RevealSection"
import Link from "next/link"
import { AuthGuardButton } from "@/components/public/AuthGuardButton"
import { WhyFigure } from "@/components/public/WhyFigure"
import {
  Palette, Globe, Gem, Leaf, ShieldCheck,
  CheckCircle2, ArrowRight,
} from "lucide-react"

export const revalidate = 3600

/* ── Inline section-header helper (RSC-compatible) ── */
function SH({
  eyebrow, title, subtitle, center,
}: { eyebrow: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`section-hd${center ? " section-hd--center" : ""}`}>
      <span className="section-hd__eyebrow">{eyebrow}</span>
      <h2 className="section-hd__title">{title}</h2>
      {subtitle && <p className="section-hd__sub">{subtitle}</p>}
      <div className="section-hd__rule" aria-hidden="true" />
    </div>
  )
}

const TRUST_ITEMS = [
  { Icon: Palette,     label: "Authentic Rwandan Art",  note: "Sourced directly from artisans" },
  { Icon: Globe,       label: "Worldwide Delivery",      note: "Safe shipping to 50+ countries" },
  { Icon: Gem,         label: "Expert Curation",         note: "Hand-selected by specialists"   },
  { Icon: Leaf,        label: "Conservation Impact",     note: "Every purchase funds wildlife"  },
  { Icon: ShieldCheck, label: "Certificate of Authenticity", note: "Verified provenance"       },
]

const STATS = [
  { val: "5,000", sup: "+", label: "Artworks" },
  { val: "4.9",   sup: "★", label: "Average Rating" },
  { val: "7,000", sup: "+", label: "Annual Visitors" },
  { val: "12",    sup: "+", label: "Years of Heritage" },
]

const PILLARS = [
  {
    href: "/art-store", num: "01", title: "Art Store",
    desc: "Authentic Rwandan paintings, sculptures & crafts sourced from local masters.",
    tag: "Shop Collection",
    img: "/images/WhatsApp Image 2026-06-30 at 8.51.41 PM.jpeg",
  },
  {
    href: "/experiences", num: "02", title: "Experiences",
    desc: "Gorilla treks, painting workshops, cultural village immersions & more.",
    tag: "Book Now",
    img: "/images/WhatsApp Image 2026-06-30 at 8.51.33 PM (3).jpeg",
  },
  {
    href: "/conservation", num: "03", title: "Conservation",
    desc: "Support Rwanda's mountain gorillas, forests & local communities.",
    tag: "Give Back",
    img: "/images/WhatsApp Image 2026-06-30 at 8.51.34 PM.jpeg",
  },
  {
    href: "/talent", num: "04", title: "Talent",
    desc: "Empowering Rwanda's next generation of artists and cultural stewards.",
    tag: "Discover",
    img: "/images/WhatsApp Image 2026-06-30 at 8.51.32 PM.jpeg",
  },
]

const WHY_POINTS = [
  "Direct sourcing from Rwandan artisans",
  "Certificate of authenticity with every piece",
  "International shipping to 50+ countries",
  "Every purchase funds conservation efforts",
]

export default async function HomePage() {
  const [featuredProducts, featuredExperiences, campaign, talentProfile, testimonials, blogPosts] =
    await Promise.all([
      db.product.findMany({ where: { featured: true, status: "PUBLISHED" }, take: 8, include: { category: true } })
        .then(ps => ps.map(p => ({ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, weight: p.weight ? Number(p.weight) : null }))),
      db.experience.findMany({ where: { featured: true, status: "PUBLISHED" }, take: 3 })
        .then(es => es.map(e => ({ ...e, durationHours: e.durationHours ? Number(e.durationHours) : null, pricePerPerson: e.pricePerPerson ? Number(e.pricePerPerson) : null, groupPrice: e.groupPrice ? Number(e.groupPrice) : null }))),
      db.conservationCampaign.findFirst({ where: { featured: true, status: "ACTIVE" } }),
      db.talentProfile.findFirst({ where: { published: true, featured: true } }),
      db.review.findMany({ where: { approved: true, featured: true }, take: 3 }),
      db.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
    ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: "Volcano Arts Center Inc Rwanda",
            description: "Rwanda's premier arts platform — authentic Rwandan art, cultural experiences, conservation and talent programmes near Volcanoes National Park.",
            url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
            image: "/images/logo.png",
            address: { "@type": "PostalAddress", addressLocality: "Musanze", addressCountry: "RW" },
            geo: { "@type": "GeoCoordinates", latitude: -1.494, longitude: 29.635 },
          })
        }}
      />

      {/* ── 1. HERO ── */}
      <HeroSection />

      {/* ── 2. TRUST TICKER ── */}
      <div className="trust-ticker" aria-hidden="true">
        <div className="trust-ticker__track">
          {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map(({ Icon, label }, i) => (
            <span key={i} className="trust-ticker__item">
              <Icon size={13} strokeWidth={2} />
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. STATS ── */}
      <RevealSection>
        <section className="stats-strip">
          <div className="stats-strip__inner container">
            {STATS.map((s, i) => (
              <div key={s.label} className="stat-item" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="stat-item__val">
                  {s.val}<sup className="stat-item__sup">{s.sup}</sup>
                </div>
                <div className="stat-item__label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ── 4. FEATURED ARTWORKS ── */}
      {featuredProducts.length > 0 && (
        <RevealSection>
          <section className="section">
            <div className="container">
              <div className="section-hd-row">
                <SH eyebrow="Curated Selection" title="Featured Artworks" />
                <Link href="/art-store" className="btn btn--ghost btn--sm section-hd-row__cta">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="art-grid">
                {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ── 5. FOUR PILLARS ── */}
      <RevealSection>
        <section className="section pillars-section">
          <div className="container">
            <SH eyebrow="What We Offer" title="Four Ways to Engage" center />
            <div className="pillar-grid">
              {PILLARS.map((p, i) => (
                <Link key={p.href} href={p.href} className="pillar" style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="pillar__media">
                    <img src={p.img} alt={p.title} loading="lazy" />
                    <div className="pillar__overlay" />
                  </div>
                  <div className="pillar__body">
                    <span className="pillar__num">{p.num}</span>
                    <h3>{p.title}</h3>
                    <p className="pillar__desc">{p.desc}</p>
                    <span className="pillar__link">
                      {p.tag} <ArrowRight size={13} className="pillar__link-arrow" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 6. WHY VAC ── */}
      <RevealSection>
        <section className="section why-section">
          <div className="container why-grid">
            {/* Visual: interactive overlapping images — real VAC photos */}
            <WhyFigure />

            {/* Copy */}
            <div className="why-copy">
              <SH eyebrow="Our Promise" title="Why Volcano Arts?" />
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, marginTop: "var(--space-1)" }}>
                Every piece is sourced directly from Rwandan artisans — supporting livelihoods,
                preserving cultural heritage, and protecting the natural world that inspires it all.
              </p>
              <ul className="why-proof">
                {WHY_POINTS.map(pt => (
                  <li key={pt} className="why-proof__item">
                    <CheckCircle2 size={16} className="why-proof__icon" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn btn--secondary" style={{ alignSelf: "flex-start", marginTop: "var(--space-4)" }}>
                Our Story
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 6b. SPONSORS TICKER ── */}
      <section className="sponsors-belt" aria-label="Our sponsors and partners">
        <div className="sponsors-belt__label">Partners &amp; Sponsors</div>
        <div className="sponsors-belt__track-wrap">
          <div className="sponsors-belt__track">
            {[
              { name: "FedEx",       img: "/images/fedex_logo.png",  height: 32 },
              { name: "Sponsor 2",   img: null },
              { name: "Sponsor 3",   img: null },
              { name: "Sponsor 4",   img: null },
              { name: "Sponsor 5",   img: null },
            ].concat([
              { name: "FedEx",       img: "/images/fedex_logo.png",  height: 32 },
              { name: "Sponsor 2",   img: null },
              { name: "Sponsor 3",   img: null },
              { name: "Sponsor 4",   img: null },
              { name: "Sponsor 5",   img: null },
            ]).map((s, i) => (
              <div key={i} className="sponsors-belt__item">
                {s.img ? (
                  <img src={s.img} alt={s.name} className="sponsors-belt__logo" />
                ) : (
                  <div className="sponsors-belt__placeholder">{s.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FEATURED EXPERIENCES ── */}
      {featuredExperiences.length > 0 && (
        <RevealSection>
          <section className="section" style={{ background: "var(--surface-raised)" }}>
            <div className="container">
              <div className="section-hd-row">
                <SH eyebrow="Immersive Rwanda" title="Featured Experiences" />
                <Link href="/experiences" className="btn btn--ghost btn--sm section-hd-row__cta">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="exp-grid">
                {featuredExperiences.map((e) => <ExperienceCard key={e.id} experience={e} />)}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ── 8. CONSERVATION SPOTLIGHT ── */}
      {campaign && (
        <RevealSection>
          <section className="conservation section">
            <div className="container">
              <div className="conservation__grid">
                <div className="conservation__media">
                  {campaign.imageUrl ? (
                    <img src={campaign.imageUrl} alt={campaign.name} />
                  ) : (
                    <div className="conservation__media-placeholder">
                      <Leaf size={56} />
                    </div>
                  )}
                  <img src="/images/WhatsApp Image 2026-06-30 at 8.51.28 PM.jpeg" alt="Gorilla wood carver at Volcano Arts Center" />
                </div>
                <div className="conservation__copy">
                  <div className="section-hd">
                    <span className="section-hd__eyebrow section-hd__eyebrow--light">Conservation</span>
                    <h2 className="section-hd__title" style={{ color: "#fff" }}>{campaign.name}</h2>
                    <div className="section-hd__rule" aria-hidden="true" />
                  </div>
                  <p className="lead">{campaign.description}</p>
                  <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100)}>
                    <div className="progress__fill" style={{ "--pct": `${Math.min(100, (Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100)}%` } as React.CSSProperties} />
                  </div>
                  <p className="progress-note">
                    <strong>{Number(campaign.raisedAmount).toLocaleString()} RWF</strong> raised of {Number(campaign.goalAmount).toLocaleString()} RWF goal · {campaign.donorCount} donors
                  </p>
                  <div className="conservation__actions">
                    <Link href="/conservation" className="btn btn--primary">Support This Campaign</Link>
                    <Link href="/conservation" className="btn btn--ghost-white">Learn More</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ── 9. TALENT SPLIT ── */}
      <RevealSection>
        <section className="talent-split">
          <div className="talent-split__copy">
            <SH eyebrow="Talent Programme" title="Empowering Rwanda's Creative Voice" />
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, marginTop: "var(--space-1)" }}>
              We nurture local talent across traditional dance, visual arts, crafts, music, and
              storytelling — preserving culture while opening new opportunities.
            </p>
            <div className="talent-split__actions">
              <Link href="/talent" className="btn btn--primary">Meet Our Talent</Link>
              <AuthGuardButton href="/talent/apply" className="btn btn--secondary">Apply to Programme</AuthGuardButton>
            </div>
          </div>
          <div className="talent-split__media">
            <PolaroidStack />
          </div>
        </section>
      </RevealSection>

      {/* ── 10. TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <RevealSection>
          <section className="section">
            <div className="container">
              <SH eyebrow="Guest Voices" title="What Our Guests Say" center />
              <div className="review-grid">
                {testimonials.map((r, i) => (
                  <RevealSection key={i} delay={i * 0.08}>
                    <ReviewCard review={r} />
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ── 11. LEAVE A REVIEW ── */}
      <RevealSection>
        <section className="section review-form-section">
          <div className="container" style={{ maxWidth: 680 }}>
            <SH eyebrow="Share Your Story" title="Had an experience with us?" center
              subtitle="Approved reviews appear on our website. We read every single one." />
            <ReviewForm />
          </div>
        </section>
      </RevealSection>

      {/* ── 11b. LIFE AT VAC — Photo mosaic ── */}
      <RevealSection>
        <section className="section vac-mosaic-section">
          <div className="container">
            <SH eyebrow="Behind the Scenes" title="Life at Volcano Arts Center" center
              subtitle="Real moments from our artisans, students, and the community around us." />
            <div className="vac-mosaic">
              <div className="vac-mosaic__tall">
                <img src="/images/WhatsApp Image 2026-06-30 at 8.51.28 PM.jpeg" alt="Wood carver at work" loading="lazy" />
              </div>
              <div className="vac-mosaic__col">
                <div className="vac-mosaic__item">
                  <img src="/images/WhatsApp Image 2026-06-30 at 8.51.30 PM.jpeg" alt="Children in outdoor art class" loading="lazy" />
                </div>
                <div className="vac-mosaic__item">
                  <img src="/images/WhatsApp Image 2026-06-30 at 8.51.40 PM.jpeg" alt="Artisans weaving baskets" loading="lazy" />
                </div>
              </div>
              <div className="vac-mosaic__col">
                <div className="vac-mosaic__item">
                  <img src="/images/WhatsApp Image 2026-06-30 at 8.51.43 PM.jpeg" alt="Traditional village cooking" loading="lazy" />
                </div>
                <div className="vac-mosaic__item">
                  <img src="/images/WhatsApp Image 2026-06-30 at 8.51.33 PM (1).jpeg" alt="Traditional culture near the volcano" loading="lazy" />
                </div>
              </div>
              <div className="vac-mosaic__tall">
                <img src="/images/WhatsApp Image 2026-06-30 at 8.52.04 PM.jpeg" alt="Traditional ceremony with artifacts" loading="lazy" />
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 12. JOURNAL ── */}
      {blogPosts.length > 0 && (
        <RevealSection>
          <section className="section" style={{ background: "var(--surface-raised)" }}>
            <div className="container">
              <div className="section-hd-row">
                <SH eyebrow="Stories & Insight" title="From the Journal" />
                <Link href="/blog" className="btn btn--ghost btn--sm section-hd-row__cta">
                  All Stories <ArrowRight size={14} />
                </Link>
              </div>
              <div className="story-grid">
                {blogPosts.map((p) => <StoryCard key={p.id} post={p} />)}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ── 13. CTA BAND ── */}
      <RevealSection>
        <section className="cta-band">
          <div className="cta-band__inner container">
            <div>
              <h2 className="cta-band__title">Collect Authentic Rwandan Fine Art</h2>
              <p className="lead">Every purchase supports artisans and protects Rwanda&apos;s natural heritage.</p>
            </div>
            <div className="cta-band__actions">
              <Link href="/art-store" className="btn btn--primary btn--lg">Shop the Collection</Link>
              <Link href="/experiences" className="btn btn--ghost-white btn--lg">Book an Experience</Link>
            </div>
          </div>
        </section>
      </RevealSection>
    </>
  )
}
