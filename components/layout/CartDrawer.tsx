"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"
import { fetchCartAction, removeFromCartAction, mergeGuestCartAction } from "@/actions/cart"
import { formatPrice } from "@/lib/utils"

interface DbItem {
  productId: string
  slug: string
  name: string
  price: number
  currency: string
  image: string | null
  quantity: number
}

export function CartDrawer() {
  const { isOpen, setOpen, guestItems, count, setCount, clearGuestCart } = useCartStore()
  const { data: session, status } = useSession()
  const [dbItems, setDbItems] = useState<DbItem[]>([])
  const [removing, setRemoving] = useState<string | null>(null)

  const close = () => setOpen(false)

  // Fetch DB cart for logged-in users
  const refreshDbCart = useCallback(async () => {
    if (!session?.user) return
    const result = await fetchCartAction()
    setDbItems(result.items as DbItem[])
    setCount(result.count)
  }, [session?.user, setCount])

  // On login: merge guest cart → DB, then refresh
  useEffect(() => {
    if (status === "authenticated" && guestItems.length > 0) {
      mergeGuestCartAction(guestItems).then(() => {
        clearGuestCart()
        refreshDbCart()
      })
    } else if (status === "authenticated") {
      refreshDbCart()
    }
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when drawer opens (logged-in users)
  useEffect(() => {
    if (isOpen && session?.user) refreshDbCart()
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) close() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen])

  const items = session?.user ? dbItems : guestItems
  const cartCurrencies = new Set(dbItems.map(i => i.currency))
  const subtotal = session?.user && cartCurrencies.size <= 1
    ? dbItems.reduce((s, i) => s + i.price * i.quantity, 0)
    : 0
  const subtotalCurrency = (dbItems[0]?.currency ?? "USD") as "USD" | "RWF"

  async function handleRemove(productId: string) {
    setRemoving(productId)
    // Optimistically remove from local state + decrement count immediately
    const removedItem = dbItems.find(i => i.productId === productId)
    if (removedItem) {
      const newItems = dbItems.filter(i => i.productId !== productId)
      setDbItems(newItems)
      setCount(Math.max(0, count - removedItem.quantity))
    }
    await removeFromCartAction(productId)
    await refreshDbCart() // sync with DB for accuracy
    setRemoving(null)
  }

  return (
    <>
      <div id="cart-overlay" onClick={close} className={isOpen ? "cart-overlay is-open" : "cart-overlay"} aria-hidden="true" />
      <div id="cart-drawer" className={isOpen ? "cart-drawer is-open" : "cart-drawer"} role="dialog" aria-modal="true" aria-label="Shopping cart">

        {/* Header */}
        <div className="cart-drawer__head">
          <h3>Your Cart {count > 0 && <span className="cart-drawer__count">{count} {count === 1 ? "item" : "items"}</span>}</h3>
          <button onClick={close} aria-label="Close cart" className="cart-drawer__close"><X size={20} /></button>
        </div>

        {/* Body */}
        {items.length > 0 ? (
          <>
            <div className="cart-drawer__body" style={{ flex: 1, overflowY: "auto", padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {session?.user ? (
                // Logged-in: show full product details
                dbItems.map((item) => (
                  <div key={item.productId} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: "var(--space-3)", alignItems: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--green-tint)", position: "relative", flexShrink: 0 }}>
                      {item.image
                        ? <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: "var(--green-tint)" }} />
                      }
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", color: "var(--text-primary)", lineHeight: 1.3 }}>
                        <Link href={`/art-store/${item.slug}`} onClick={close} style={{ color: "inherit" }}>{item.name}</Link>
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--green)", marginTop: 2 }}>
                        {formatPrice(item.price, item.currency as "USD" | "RWF")} × {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removing === item.productId}
                      aria-label="Remove item"
                      style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4, opacity: removing === item.productId ? 0.4 : 1 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                // Guest: show productId (no product data lookup for guests)
                guestItems.map((item) => (
                  <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)" }}>{item.productId.slice(0, 12)}…</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="cart-drawer__foot">
              {subtotal > 0 && (
                <div className="cart-drawer__subtotal">
                  <span>Subtotal</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>{formatPrice(subtotal, subtotalCurrency)}</span>
                </div>
              )}
              <Link href="/cart" className="btn btn--primary cart-drawer__checkout" onClick={close}>
                Proceed to Checkout
              </Link>
            </div>
          </>
        ) : (
          // Empty state — only shown when drawer is opened manually with no items
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "var(--space-9) var(--space-5)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", fontSize: "var(--text-small)" }}>Your cart is empty</p>
            <Link href="/art-store" className="btn btn--ghost btn--sm" onClick={close}>Browse the Shop</Link>
          </div>
        )}
      </div>
    </>
  )
}
