import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileForm, type ProfileUser } from "../ProfileForm"

export const dynamic = "force-dynamic"

export default async function ClientProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/profile")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { where: { provider: "google" }, select: { id: true } } },
  })
  if (!user) redirect("/login")

  const profileUser: ProfileUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    profileImageUrl: user.profileImageUrl,
    image: user.image,
    name: user.name,
    createdAt: user.createdAt,
    isGoogleUser: user.accounts.length > 0,
  }

  return <ProfileForm user={profileUser} />
}
