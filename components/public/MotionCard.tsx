"use client"
import { motion } from "framer-motion"

// Client wrapper that adds hover lift to any server-rendered card
export function MotionCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style} whileHover={{ y: -3 }} whileTap={{ y: 0 }} transition={{ duration: 0.12 }}>
      {children}
    </motion.div>
  )
}
