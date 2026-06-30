import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?next=/client/dashboard")

  return <>{children}</>
}
