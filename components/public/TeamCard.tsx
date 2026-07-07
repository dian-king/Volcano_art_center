"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { Mail, MessageCircle } from "lucide-react"

export interface TeamMember {
  name: string
  role: string
  email: string
  whatsapp?: string
  initial: string
  color: string
}

export function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const reduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className="team-card"
      initial={reduced ? false : { opacity: 0, y: 28, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 }}
      whileHover={reduced ? {} : { y: -6 }}
    >
      <div className="team-card__avatar" style={{ background: member.color }}>
        <span>{member.initial}</span>
      </div>
      <p className="team-card__name">{member.name}</p>
      <p className="team-card__role">{member.role}</p>
      <div className="team-card__actions">
        <a href={`mailto:${member.email}`} className="team-card__email">
          <Mail size={14} />
          <span>{member.email}</span>
        </a>
        {member.whatsapp && (
          <a href={`https://wa.me/${member.whatsapp}`} target="_blank" rel="noopener noreferrer" className="team-card__whatsapp">
            <MessageCircle size={14} />
            WhatsApp
          </a>
        )}
      </div>
    </motion.div>
  )
}
