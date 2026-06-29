import Link from "next/link"
import { CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Order Placed" }

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { ref } = await searchParams

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 520, width: "90%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-5)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--color-success-bg)", display: "grid", placeItems: "center" }}>
          <CheckCircle size={40} style={{ color: "var(--color-success)" }} />
        </div>

        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Order Placed!
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.7 }}>
            Thank you for your order. Please complete payment using the reference below.
          </p>
        </div>

        {ref && (
          <div style={{ background: "var(--green-tint)", border: "1px solid var(--green)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", width: "100%" }}>
            <p style={{ fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-2)" }}>Your order reference</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-title)", fontWeight: 700, color: "var(--green)" }}>{ref}</p>
          </div>
        )}

        <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", width: "100%", textAlign: "left" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>Send payment to:</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
            <li><strong style={{ color: "var(--text-primary)" }}>MTN MoMo:</strong> +250 788 000 000</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Airtel Money:</strong> +250 733 000 000</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Bank Transfer:</strong> Details sent to your email</li>
          </ul>
          <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
            Use <strong style={{ fontFamily: "var(--font-mono)" }}>{ref}</strong> as your payment reference. We confirm within 24 hours.
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/client/dashboard?tab=orders" className="btn btn--primary">View My Orders</Link>
          <a
            href={`https://wa.me/250780000000?text=${encodeURIComponent(`Hi, I just placed order ${ref} on Volcano Arts Center. Please confirm my payment.`)}`}
            target="_blank"
            rel="noopener"
            className="btn btn--primary"
            style={{ background: "#25D366", borderColor: "#25D366", display: "flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Confirm via WhatsApp
          </a>
          <Link href="/art-store" className="btn btn--ghost">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
