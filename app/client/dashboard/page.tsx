import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const metadata = { title: "My Account | Volcano Arts Center" }

export default function DashboardPage() {
  redirect("/client/dashboard/profile")
}
