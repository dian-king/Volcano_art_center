"use client"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, ShoppingBag } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"
import { useToastStore } from "@/store/toast-store"
import { addToCartAction } from "@/actions/cart"

export function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const { data: session } = useSession()
  const { count, setCount } = useCartStore()
  const { addToast } = useToastStore()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCartAction(productId),
    onSuccess: () => {
      setAdded(true)
      setCount(count + 1)
      addToast("Added to cart", "success")
      setTimeout(() => setAdded(false), 2500)
    },
    onError: () => addToast("Could not add to cart", "error"),
  })

  if (!inStock) return <span className="chip chip--muted">Sold out</span>

  function handleClick() {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    mutate()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || added}
      aria-label="Add to cart"
      title={added ? "Added!" : "Add to cart"}
      style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: "1px solid var(--border-subtle)",
        background: added ? "var(--green)" : "var(--surface-raised)",
        color: added ? "#fff" : "var(--text-primary)",
        display: "grid", placeItems: "center",
        cursor: isPending ? "wait" : "pointer",
        transition: "background 0.2s, color 0.2s",
        flexShrink: 0,
      }}
    >
      {isPending ? <Loader2 size={15} className="animate-spin" /> : added ? <Check size={15} /> : <ShoppingBag size={15} />}
    </button>
  )
}
