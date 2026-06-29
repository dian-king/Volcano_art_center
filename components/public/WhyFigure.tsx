"use client"
import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

const SPRING = { type: "spring" as const, stiffness: 280, damping: 18 }

export function WhyFigure() {
  const [swapped, setSwapped]   = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reduced     = useReducedMotion()

  function onEnter() {
    if (intervalRef.current) return
    setSwapped(true)
    intervalRef.current = setInterval(() => setSwapped(p => !p), 2000)
  }

  function onLeave() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setSwapped(false)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return (
    <div
      className="why-figure"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Back image — pops to front when swapped */}
      <motion.div
        className="why-figure__a"
        animate={reduced ? {} : {
          scale:  swapped ? 1.07 : 1,
          y:      swapped ? "-10%" : "0%",
          rotate: swapped ? 2 : 0,
          zIndex: swapped ? 3 : 1,
        }}
        transition={SPRING}
      >
        <img
          src="/images/wide6.jpeg"
          alt="Artisan at work"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>

      {/* Front image — retreats when swapped */}
      <motion.div
        className="why-figure__b"
        animate={reduced ? {} : {
          scale:  swapped ? 0.88 : 1,
          y:      swapped ? "10%" : "0%",
          rotate: swapped ? -2 : 0,
          zIndex: swapped ? 1 : 2,
        }}
        transition={SPRING}
      >
        <img
          src="/images/wide4.jpeg"
          alt="Gallery entrance"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>

      <div className="why-rating">
        <span>★★★★★</span>
        <strong>4.9 / 5</strong>
        <small>7,000+ guests</small>
      </div>
    </div>
  )
}
