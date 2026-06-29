import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { CartDrawer } from "@/components/layout/CartDrawer"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?next=/client/dashboard")

  return (
    <>
      <PublicNav />
      <main id="main-content">{children}</main>
      <PublicFooter />
      <CartDrawer />
    </>
  )
}
