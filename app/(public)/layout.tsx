import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { CartDrawer } from "@/components/layout/CartDrawer"
import { PageTransition } from "@/components/ui/PageTransition"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <PublicFooter />
      <CartDrawer />
    </>
  )
}