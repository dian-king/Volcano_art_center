import { ContactForm } from "@/components/forms/ContactForm"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Volcano Arts Center team in Musanze, Rwanda.",
}

export default function ContactPage() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>We'd love to hear from you</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            Contact Us
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            Whether you're interested in art, experiences, or a partnership — we're here.
          </p>
        </div>
      </div>

      <div className="container split-2 split-2--start" style={{ paddingBlock: "var(--space-8)" }}>

        {/* Left: info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Gallery photo */}
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "16/9" }}>
            <Image
              src="/images/wide4.jpeg"
              alt="Volcano Arts Center entrance"
              width={700} height={394}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Contact details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {[
              {
                icon: "📍",
                label: "Location",
                value: "GJQ7+P76, Musanze, Rwanda",
                href: "https://maps.google.com/?q=Volcano+Arts+%26+Hospes+GJQ7%2BP76+Musanze+Rwanda",
              },
              {
                icon: "📧",
                label: "Email",
                value: "hello@volcanoartsandhospes.com",
                href: "mailto:hello@volcanoartsandhospes.com",
              },
              {
                icon: "📞",
                label: "Phone",
                value: "+250 788 945 163",
                href: "tel:+250788945163",
              },
              {
                icon: "🕐",
                label: "Opening Hours",
                value: "Mon–Sat 8:00am – 6:00pm · Sun 9:00am – 4:00pm",
                href: null,
              },
            ].map(({ icon, label, value, href }) => (
              <div key={label} style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: 2 }}>{icon}</span>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-caption)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>{label}</p>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" style={{ color: "var(--green)", fontSize: "var(--text-small)", textDecoration: "none" }}>
                      {value}
                    </a>
                  ) : (
                    <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Maps embed */}
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-subtle)", height: 240 }}>
            <iframe
              title="Volcano Arts Center on Google Maps"
              src="https://maps.google.com/maps?q=Volcano+Arts+%26+Hospes+Musanze+Rwanda&output=embed&z=15"
              width="100%"
              height="240"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right: form */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
            Send us a message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}

