"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Props {
  href: string           // destination when logged in
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function AuthGuardButton({ href, className, style, children }: Props) {
  const { data: session } = useSession()
  const router = useRouter()

  function handle(e: React.MouseEvent) {
    e.preventDefault()
    if (session?.user) {
      router.push(href)
    } else {
      router.push(`/login?next=${encodeURIComponent(href)}`)
    }
  }

  return (
    <a href={href} onClick={handle} className={className} style={style}>
      {children}
    </a>
  )
}
