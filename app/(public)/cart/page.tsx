"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"
import { fetchCartAction, removeFromCartAction, fetchProductsByIds } from "@/actions/cart"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Trash2 } from "lucide-react"

interface DbItem {
  productId: string
  slug: string
  name: string
  price: number
  image: string | null
  quantity: number
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const { guestItems, count, removeGuestItem, setCount } = useCartStore()
  const [dbItems, setDbItems] = useState<DbItem[]>([])
  const [guestDetails, setGuestDetails] = useState<Record<string, { name: string; price: number; image: string | null; slug: string }>>({})
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (session?.user) {
      fetchCartAction().then(r => {
        setDbItems(r.items as DbItem[])
        setCount(r.count)
        setLoading(false)
      })
    } else {
      // Fetch product details for guest cart items
      const ids = guestItems.map(i => i.productId)
      if (ids.length) {
        fetchProductsByIds(ids).then(products => {
          const map: Record<string, { name: string; price: number; image: string | null; slug: string }> = {}
          products.forEach(p => { map[p.id] = { name: p.name, price: p.price, image: p.primaryImageUrl, slug: p.slug } })
          setGuestDetails(map)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }
  }, [status, session?.user, guestItems.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const items = session?.user ? dbItems : guestItems
  const subtotal = session?.user
    ? dbItems.reduce((s, i) => s + i.price * i.quantity, 0)
    : guestItems.reduce((s, i) => s + (guestDetails[i.productId]?.price ?? 0) * i.quantity, 0)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  async function handleRemove(productId: string) {
    setRemoving(productId)
    if (session?.user) {
      // Optimistic update
      const removed = dbItems.find(i => i.productId === productId)
      if (removed) {
        setDbItems(prev => prev.filter(i => i.productId !== productId))
        setCount(Math.max(0, count - removed.quantity))
      }
      await removeFromCartAction(productId)
      const r = await fetchCartAction()
      setDbItems(r.items as DbItem[])
      setCount(r.count)
    } else {
      removeGuestItem(productId)
    }
    setRemoving(null)
  }

  if (loading) return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Loading cart…</p>
    </div>
  )

  if (items.length === 0) return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "var(--space-9) var(--space-5)", textAlign: "center" }}>
      <ShoppingBag size={52} style={{ color: "var(--text-muted)" }} />
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Your cart is empty</h1>
      <p style={{ color: "var(--text-secondary)" }}>Discover authentic Rwandan art and culture</p>
      <Link href="/art-store" className="btn btn--primary">Browse the Collection</Link>
    </div>
  )

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-6) 0" }}>
        <div className="container">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "#fff" }}>
            Shopping Cart
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-ui)", fontSize: "var(--text-small)", marginTop: "var(--space-1)" }}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)", display: "grid", gridTemplateColumns: "1fr 360px", gap: "var(--space-7)", alignItems: "start" }}>

        {/* Items list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {session?.user ? (
            dbItems.map(item => (
              <div key={item.productId} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", alignItems: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--green-tint)", position: "relative", flexShrink: 0 }}>
                  {item.image
                    ? <Image src={item.image} alt={item.name} fill unoptimized style={{ objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "var(--green-tint)" }} />
                  }
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-body)", color: "var(--text-primary)" }}>
                    <Link href={`/art-store/${item.slug}`} style={{ color: "inherit" }}>{item.name}</Link>
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--green)", marginTop: "var(--space-1)" }}>
                    {item.price.toLocaleString()} RWF × {item.quantity}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: 2 }}>
                    Line total: {(item.price * item.quantity).toLocaleString()} RWF
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={removing === item.productId}
                  aria-label="Remove item"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "var(--space-2)", opacity: removing === item.productId ? 0.4 : 1 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            // Guest — show real product data fetched by ID
            guestItems.map(item => {
              const p = guestDetails[item.productId]
              return (
              <div key={item.productId} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", alignItems: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--green-tint)", position: "relative", flexShrink: 0 }}>
                  {p?.image ? <Image src={p.image} alt={p.name} fill unoptimized style={{ objectFit: "cover" }} /> : null}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-body)", color: "var(--text-primary)" }}>
                    {p ? <Link href={`/art-store/${p.slug}`} style={{ color: "inherit" }}>{p.name}</Link> : `Item #${item.productId.slice(-8)}`}
                  </p>
                  {p && <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--green)", marginTop: "var(--space-1)" }}>{p.price.toLocaleString()} RWF × {item.quantity}</p>}
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: 2 }}>
                    <Link href="/login?next=/cart" style={{ color: "var(--green)" }}>Sign in</Link> to checkout
                  </p>
                </div>
                <button onClick={() => handleRemove(item.productId)} aria-label="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "var(--space-2)" }}>
                  <Trash2 size={18} />
                </button>
              </div>
              )
            })
          )}
        </div>

        {/* Order summary */}
        <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-5)" }}>Order Summary</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{subtotal > 0 ? `${subtotal.toLocaleString()} RWF` : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span style={{ fontFamily: "var(--font-ui)" }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontSize: "var(--text-lead)" }}>
                {subtotal > 0 ? `${subtotal.toLocaleString()} RWF` : "—"}
              </span>
            </div>
          </div>

          {session?.user ? (
            <Link href="/checkout" className="btn btn--primary" style={{ display: "block", textAlign: "center", width: "100%" }}>
              Proceed to Checkout
            </Link>
          ) : (
            <>
              <Link href="/login?next=/cart" className="btn btn--primary" style={{ display: "block", textAlign: "center", width: "100%", marginBottom: "var(--space-3)" }}>
                Sign in to Checkout
              </Link>
              <p style={{ textAlign: "center", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>
                or <Link href="/register" style={{ color: "var(--green)" }}>create an account</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
