import { ChangePasswordForm } from "@/app/client/dashboard/ChangePasswordForm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { card } from "../_styles"

export const dynamic = "force-dynamic"

export default async function ClientSecurityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/security")
  const googleAccount = await db.account.findFirst({ where: { userId: session.user.id, provider: "google" }, select: { id: true } })

  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>Security</h1>
      {googleAccount ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>Password changes are managed through your sign-in provider.</p>
      ) : (
        <ChangePasswordForm />
      )}
    </section>
  )
}
