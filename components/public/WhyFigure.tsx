"use client"
import { useEffect, useRef, useState } from "react"

const CARDS = [
  { src: "/images/WhatsApp Image 2026-06-30 at 8.51.40 PM.jpeg", alt: "Rwandan artisans weaving traditional baskets" },
  { src: "/images/gorilla-sculpture.jpeg", alt: "Carving a lava-stone gorilla sculpture" },
  { src: "/images/WhatsApp Image 2026-06-27 at 1.59.51 PM.jpeg", alt: "Carrying finished woven baskets in our gallery" },
]

// Idle stack offsets by depth — a loose, tossed-on-a-table scatter
const SLOTS = [
  { x: -3,  y: 3,   rot: -4 },
  { x: 20,  y: -8,  rot: 9  },
  { x: -22, y: -18, rot: -12 },
]

export function WhyFigure() {
  const [order, setOrder] = useState<number[]>(CARDS.map((_, i) => i))
  const [leaving, setLeaving] = useState<number | null>(null)
  const [hovering, setHovering] = useState(false)
  const [exitDir, setExitDir] = useState(1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!hovering) return
    const t = setTimeout(() => {
      const top = order[0]
      setLeaving(top)
      timeoutRef.current = setTimeout(() => {
        setOrder(o => { const [f, ...r] = o; return [...r, f] })
        setLeaving(null)
        setExitDir(d => d * -1)
      }, 500)
    }, 1400)
    return () => { clearTimeout(t); if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [order, hovering])

  function onLeave() {
    setHovering(false)
    setLeaving(null)
    setOrder(CARDS.map((_, i) => i))
    setExitDir(1)
  }

  return (
    <div
      className="why-figure"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      {[...order].reverse().map((cardIdx, ri) => {
        const depth = order.length - 1 - ri
        const slot = SLOTS[Math.min(depth, SLOTS.length - 1)]
        const isLeaving = cardIdx === leaving
        const card = CARDS[cardIdx]

        return (
          <div
            key={cardIdx}
            className="why-figure__stack-card"
            style={{
              zIndex: CARDS.length - depth,
              transform: isLeaving
                ? `translateX(${160 * exitDir}%) rotate(${18 * exitDir}deg)`
                : `translate(${slot.x}%, ${slot.y}%) rotate(${slot.rot}deg)`,
              transition: isLeaving
                ? "transform 0.5s cubic-bezier(0.4,0,1,1)"
                : "transform 0.6s cubic-bezier(0.25,0.9,0.4,1.3)",
            }}
          >
            <img src={card.src} alt={card.alt} draggable={false} />
          </div>
        )
      })}

      <div className="why-rating">
        <span>★★★★★</span>
        <strong>4.9 / 5</strong>
        <small>7,000+ guests</small>
      </div>
    </div>
  )
}
