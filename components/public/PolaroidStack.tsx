"use client"
import { useEffect, useState } from "react"

const CARDS = [
  { src: "/images/talent-wood-carver.jpeg",       caption: "Wood carving at VAC" },
  { src: "/images/talent-kids-drawing-1.jpeg",    caption: "Young artists at dusk" },
  { src: "/images/talent-carver-collection.jpeg", caption: "Gorilla sculpture series" },
  { src: "/images/talent-gorilla-sketch.jpeg",    caption: "Pencil study, age 12" },
  { src: "/images/talent-kids-drawing-2.jpeg",    caption: "Open-air drawing class" },
  { src: "/images/talent-mountain-road.jpeg",     caption: "Near Volcanoes National Park" },
  { src: "/images/talent-highlands-man.jpeg",     caption: "Highlands pastoral life" },
  { src: "/images/talent-basket-weavers.jpeg",    caption: "Traditional basket weaving" },
]

// Each depth level has a scattered position relative to container center
// depth 0 = top card (most visible), higher = further back
const SLOTS = [
  { x: -20, y: -10, rot: -2  },   // top — slightly left of center
  { x:  60, y:  30, rot:  9  },   // 2nd — right, below
  { x: -70, y:  25, rot: -12 },   // 3rd — left, below
  { x:  70, y: -20, rot:  6  },   // 4th — right, above
  { x: -40, y:  55, rot: -7  },   // 5th — left, further down
]

export function PolaroidStack() {
  const [order, setOrder] = useState<number[]>(CARDS.map((_, i) => i))
  const [leaving, setLeaving] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const top = order[0]
      setLeaving(top)
      const exitT = setTimeout(() => {
        setOrder(o => { const [f, ...r] = o; return [...r, f] })
        setLeaving(null)
      }, 650)
      return () => clearTimeout(exitT)
    }, 2000)
    return () => clearTimeout(t)
  }, [order])

  return (
    <div className="polaroid-stack">
      {[...order].reverse().map((cardIdx, ri) => {
        const depth = order.length - 1 - ri
        const slot = SLOTS[Math.min(depth, SLOTS.length - 1)]
        const isLeaving = cardIdx === leaving

        return (
          <div
            key={cardIdx}
            className="polaroid-card"
            style={{
              zIndex: CARDS.length - depth,
              transform: isLeaving
                ? `translate(calc(-50% + 600px), -50%) rotate(22deg)`
                : `translate(calc(-50% + ${slot.x}px), calc(-50% + ${slot.y}px)) rotate(${slot.rot}deg)`,
              transition: isLeaving
                ? "transform 0.55s cubic-bezier(0.4,0,1,1)"
                : "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            <div className="polaroid-card__photo">
              <img src={CARDS[cardIdx].src} alt={CARDS[cardIdx].caption} draggable={false} />
            </div>
            <p className="polaroid-card__caption">{CARDS[cardIdx].caption}</p>
          </div>
        )
      })}
    </div>
  )
}
