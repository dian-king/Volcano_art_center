import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the Volcano Arts Center — our mission, team, and impact in Rwanda.",
}

export default function AboutPage() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ position: "relative", background: "var(--green-deep)", overflow: "hidden", padding: "var(--space-10) 0 var(--space-8)" }}>
        <img src="/images/WhatsApp Image 2026-06-27 at 1.59.54 PM (2).jpeg" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.38 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Our Story</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            About Us
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            Art, community, and conservation at the foot of the Virungas
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container split-2" style={{ paddingBlock: "var(--space-8)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span className="eyebrow">Our Mission</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>
            Rwanda's Creative Heart
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            The Volcano Arts Center (VAC) is a cultural hub nestled at the base of the Virunga volcanoes in northern Rwanda. We exist to celebrate Rwandan creativity, connect artists with global audiences, and support the conservation of the extraordinary natural landscapes that inspire our community.
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Founded in Musanze District — gateway to Volcanoes National Park — everything we create is shaped by the dramatic volcanic landscape and the living culture of the people who call it home.
          </p>
        </div>
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4/3" }}>
          <img
            src="/images/WhatsApp Image 2026-06-27 at 1.59.58 PM.jpeg"
            alt="Volcano Arts Center courtyard"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* What we do */}
      <div style={{ background: "var(--surface)", paddingBlock: "var(--space-8)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <span className="eyebrow">What We Do</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginTop: "var(--space-2)" }}>
              Four Pillars of Purpose
            </h2>
          </div>
          <div className="pillar-grid">
            {[
              { img: "/images/WhatsApp Image 2026-06-30 at 8.51.41 PM.jpeg", title: "Art & Commerce", desc: "Our art store brings authentic Rwandan paintings, sculpture, textiles, and photography to collectors worldwide, ensuring artists receive fair compensation for their work." },
              { img: "/images/WhatsApp Image 2026-06-27 at 1.59.57 PM.jpeg", title: "Immersive Experiences", desc: "We design cultural tours, painting workshops, village visits, and conservation walks that connect visitors with Rwanda's living traditions and natural wonders." },
              { img: "/images/talent-gorilla-sketch.jpeg", title: "Talent Development", desc: "Through our Talent Programme, we support emerging artists with mentorship, studio space, exhibitions, and pathways to international markets." },
              { img: "/images/WhatsApp Image 2026-06-30 at 8.51.37 PM (1).jpeg", title: "Conservation", desc: "We fund and advocate for conservation initiatives protecting the ecosystems that sustain Rwanda's biodiversity and inspire its art — including mountain gorilla habitat." },
            ].map(({ img, title, desc }) => (
              <div key={title} className="pillar">
                <div className="pillar__media">
                  <img src={img} alt="" loading="lazy" />
                </div>
                <div className="pillar__body">
                  <h3>{title}</h3>
                  <p className="pillar__desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery photos strip */}
      <div className="photo-strip">
        {[
          "/images/WhatsApp Image 2026-06-27 at 1.59.54 PM (2).jpeg",
          "/images/WhatsApp Image 2026-06-30 at 8.51.42 PM.jpeg",
          "/images/WhatsApp Image 2026-06-30 at 8.51.40 PM.jpeg",
        ].map((src, i) => (
          <div key={i} style={{ overflow: "hidden" }}>
            <img src={src} alt="VAC gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      {/* Leadership */}
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        <span className="eyebrow">Leadership</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginTop: "var(--space-2)", marginBottom: "var(--space-7)" }}>The Team</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem" }}>N</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "var(--text-body)", marginBottom: 2 }}>NTIHEMUKA Jean d&apos;Amour</p>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-small)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-2)" }}>Director Manager</p>
            <a href="mailto:ntihemuka@volcanoartscenterinc.org.rw" style={{ color: "var(--green-mid)", fontSize: "var(--text-small)" }}>ntihemuka@volcanoartscenterinc.org.rw</a>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="container split-2" style={{ paddingBlock: "var(--space-8)" }}>
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", height: 280 }}>
          <iframe
            title="VAC on Google Maps"
            src="https://maps.google.com/maps?q=Volcano+Arts+%26+Hospes+Musanze+Rwanda&output=embed&z=15"
            width="100%" height="280"
            style={{ border: 0, display: "block" }}
            loading="lazy"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span className="eyebrow">Our Location</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Find Us in Musanze</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            We are based at <strong>GJQ7+P76, Musanze, Rwanda</strong> — just minutes from the gates of Volcanoes National Park and the world-famous mountain gorilla habitat.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn--primary">Contact Us</Link>
            <a href="https://maps.google.com/?q=Volcano+Arts+%26+Hospes+GJQ7%2BP76+Musanze+Rwanda" target="_blank" rel="noopener" className="btn btn--secondary">Get Directions</a>
          </div>
        </div>
      </div>
    </div>
  )
}

