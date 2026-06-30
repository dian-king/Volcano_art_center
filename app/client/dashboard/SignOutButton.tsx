"use client"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="app-dashboard__footer-link app-dashboard__footer-link--logout"
      type="button"
    >
      <LogOut size={15} />
      <span>Sign Out</span>
    </button>
  )
}
