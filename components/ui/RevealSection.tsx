"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

interface RevealSectionProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  delay?: number
}

export function RevealSection({ children, style, className, delay = 0 }: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const reduced  = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
