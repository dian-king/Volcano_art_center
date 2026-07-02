"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart-store"
import { fetchCartAction } from "@/actions/cart"
import { createOrderAction } from "@/actions/checkout"
import { useToastStore } from "@/store/toast-store"
import Image from "next/image"
import Link from "next/link"
import { CountrySelect } from "@/components/ui/CountrySelect"

interface DbItem { productId: string; slug: string; name: string; price: number; image: string | null; quantity: number }

const inp: React.CSSProperties = { height: "44px", padding: "0 var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-base)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%" }
const lbl: React.CSSProperties = { fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-1)", display: "block" }

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToast } = useToastStore()
  const { count, setCount } = useCartStore()

  const [items, setItems] = useState<DbItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [country, setCountry] = useState("Rwanda")

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login?next=/checkout"); return }
    if (status === "loading") return
    fetchCartAction().then(r => {
      setItems(r.items as DbItem[])
      setCount(r.count)
      if (r.count === 0) router.replace("/cart")
      setLoading(false)
    })
  }, [status, count]) // re-fetch when count changes (e.g. item removed from drawer) // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    fd.set("country", country)
    const result = await createOrderAction(fd)
    setSubmitting(false)
    if (result?.error) { addToast(result.error, "error"); return }
    setCount(0)
    router.push(`/checkout/success?ref=${result.reference}`)
  }

  if (loading || status === "loading") return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-6) 0" }}>
        <div className="container">
          <Link href="/cart" style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Back to cart</Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "#fff", marginTop: "var(--space-2)" }}>Checkout</h1>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)", display: "grid", gridTemplateColumns: "1fr 380px", gap: "var(--space-7)", alignItems: "start" }}>

        {/* Shipping form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
            <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-5)" }}>Shipping Details</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div>
                <label style={lbl}>Full name *</label>
                <input name="recipientName" required style={inp} defaultValue={`${session?.user?.name ?? ""}`} />
              </div>

              <div>
                <label style={lbl}>Address line 1 *</label>
                <input name="addressLine1" required style={inp} placeholder="Street address, P.O. box" />
              </div>

              <div>
                <label style={lbl}>Address line 2</label>
                <input name="addressLine2" style={inp} placeholder="Apartment, suite, unit, etc." />
              </div>

              <div className="form-row">
                <div>
                  <label style={lbl}>City *</label>
                  <input name="city" required style={inp} />
                </div>
                <div>
                  <label style={lbl}>State / Province</label>
                  <input name="state" style={inp} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={lbl}>Postal code *</label>
                  <input name="postalCode" required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Country *</label>
                  <CountrySelect value={country} onChange={setCountry} />
                  <input type="hidden" name="country" value={country} />
                </div>
              </div>

              <div>
                <label style={lbl}>Order notes (optional)</label>
                <textarea name="notes" rows={3} style={{ ...inp, height: "auto", padding: "var(--space-3) var(--space-4)", resize: "vertical" }} placeholder="Special instructions, gift message, etc." />
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
            <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-4)" }}>Payment</h2>
            <div style={{ background: "var(--green-tint)", border: "1px solid var(--green)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "var(--space-2)" }}>We accept the following payment methods:</strong>
              <ul style={{ listStyle: "disc", paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <li><strong>MTN MoMo:</strong> +250 788 945 163</li>
                <li><strong>Airtel Money:</strong> +250 733 000 000</li>
                <li><strong>Bank Transfer:</strong> Bank of Kigali — Account details sent via email</li>
              </ul>
              <p style={{ marginTop: "var(--space-3)", color: "var(--text-muted)" }}>
                After placing your order, you will receive a reference number. Use it as the payment reference. Our team confirms payment within 24 hours.
              </p>
            </div>
          </div>

          <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", height: "52px", fontSize: "var(--text-body)" }} disabled={submitting}>
            {submitting ? "Placing order…" : `Place Order · ${subtotal.toLocaleString()} RWF`}
          </button>
        </form>

        {/* Order summary */}
        <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-5)" }}>Order Summary</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            {items.map(item => (
              <div key={item.productId} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--green-tint)", position: "relative", flexShrink: 0 }}>
                  {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--text-primary)", flexShrink: 0 }}>{(item.price * item.quantity).toLocaleString()} RWF</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{subtotal.toLocaleString()} RWF</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>
              <span>Shipping</span>
              <span>Calculated by team</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)" }}>
              <span style={{ fontFamily: "var(--font-ui)" }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontSize: "var(--text-lead)" }}>{subtotal.toLocaleString()} RWF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
