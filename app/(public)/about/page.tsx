import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { TeamCard, type TeamMember } from "@/components/public/TeamCard"

const TEAM: TeamMember[] = [
  { name: "NTIHEMUKA Jean d'Amour", role: "Director Manager", email: "ntihemuka@volcanoartscenterinc.org.rw", initial: "N", color: "var(--green-deep)" },
  { name: "Olive Niyizigihe", role: "Operations Manager", email: "Oliveni@volcanoartscenterinc.org.rw", initial: "O", color: "#1C4A30" },
  { name: "Imanizabayo Jean Marie Vianey", role: "Marketing Manager", email: "Danken@volcanoartscenterinc.org.rw", whatsapp: "250787898630", initial: "I", color: "#3D1F00" },
]

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

      {/* About Us */}
      <div className="container split-2" style={{ paddingBlock: "var(--space-8)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span className="eyebrow">About Us</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>
            Rwanda's Creative Heart
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            The Volcano Arts Center (VAC) is a cultural hub nestled at the base of the Virunga volcanoes in northern Rwanda. We exist to celebrate Rwandan creativity, connect artists with global audiences, and support the conservation of the extraordinary natural landscapes that inspire our community.
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Founded in Musanze District — gateway to Volcanoes National Park — VAC is a Musanze-based social enterprise and community development initiative. Everything we create is shaped by the dramatic volcanic landscape and the living culture of the people who call it home, and every visit, purchase, and booking directly supports the artists and families behind it.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
            {["🏔 Est. in Musanze", "🤝 Community-Owned", "🌍 Trusted by Travelers Worldwide"].map(t => (
              <span key={t} className="chip chip--neutral" style={{ fontSize: "var(--text-caption)" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4/3" }}>
          <img
            src="/images/WhatsApp Image 2026-06-27 at 1.59.58 PM.jpeg"
            alt="Volcano Arts Center courtyard"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Our Mission — visually distinct banner treatment */}
      <div style={{ position: "relative", background: "var(--green-deep)", overflow: "hidden", paddingBlock: "var(--space-9)" }}>
        <img
          src="/images/WhatsApp Image 2026-06-30 at 8.51.42 PM.jpeg"
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "820px", textAlign: "center", marginInline: "auto" }}>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Our Mission</span>
          <p style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 600,
            fontSize: "var(--text-title)", lineHeight: 1.5, color: "#fff", marginTop: "var(--space-4)",
          }}>
            "To empower communities through arts, education, cultural preservation, social inclusion, entrepreneurship, and community-based tourism — creating sustainable pathways for personal and economic growth."
          </p>
        </div>
      </div>

      {/* Who We Serve */}
      <div style={{ background: "var(--surface)", paddingBlock: "var(--space-8)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <span className="eyebrow">Who We Serve</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginTop: "var(--space-2)" }}>
              Empowering Every Member of Our Community
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-6)" }}>
            {[
              { title: "People Living with Disabilities", desc: "Inclusive programs that encourage participation, creativity, skills development, and economic empowerment." },
              { title: "Children and Youth", desc: "Safe and engaging spaces where young people can learn, explore creativity, develop life skills, and discover their potential beyond the classroom." },
              { title: "Single Mothers", desc: "Skills development, entrepreneurship opportunities, mentorship, and income-generating activities that strengthen family livelihoods." },
              { title: "Elderly Community Members", desc: "Cultural storytelling, social participation, intergenerational learning, and community-based activities that preserve knowledge and heritage." },
            ].map(({ title, desc }) => (
              <div key={title} style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", marginBottom: "var(--space-2)" }}>{title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Areas of Work */}
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <span className="eyebrow">Key Areas of Work</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginTop: "var(--space-2)" }}>
            How We Create Impact
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-6)" }}>
          {[
            { title: "Arts & Creative Development", desc: "Using visual arts, performance, storytelling, and cultural expression as tools for education, empowerment, and social transformation." },
            { title: "Community Empowerment", desc: "Designing programs that strengthen resilience, self-reliance, leadership, and social inclusion within local communities." },
            { title: "Cultural Preservation", desc: "Documenting, celebrating, and sharing Rwanda's rich cultural heritage while creating opportunities for cultural exchange and learning." },
            { title: "Community-Based Tourism", desc: "Developing authentic tourism experiences that connect visitors with local communities while generating income and supporting sustainable development." },
            { title: "Environmental Stewardship", desc: "Promoting community awareness and responsible practices that support conservation and long-term environmental sustainability." },
          ].map(({ title, desc }) => (
            <div key={title} style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
              <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", marginBottom: "var(--space-2)", color: "var(--green)" }}>{title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
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
        <div className="team-grid">
          {TEAM.map((member, i) => <TeamCard key={member.email} member={member} index={i} />)}
        </div>
      </div>

      {/* Vision & Partnerships */}
      <div className="container split-2" style={{ paddingBlock: "var(--space-8)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span className="eyebrow">Our Vision</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>
            A Thriving, Inclusive Society
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            A thriving and inclusive society where culture, creativity, conservation, and community development work together to improve lives and create sustainable opportunities for future generations.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span className="eyebrow">Partnership Opportunities</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>
            Collaborate With Us
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            We welcome collaboration with foundations, conservation organizations, tourism partners, educational institutions, corporations, development agencies, and individuals who share our commitment to inclusive community development and sustainable impact.
          </p>
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

