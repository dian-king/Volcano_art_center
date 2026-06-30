"use server"
import { auth, signIn } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateTalentRef } from "@/lib/references"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  program: z.string().min(1, "Please select a programme"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  applicantCategory: z.string().min(1),
  talentArea: z.string().min(1),
  experienceDesc: z.string().min(20, "Please describe your experience (min 20 characters)"),
  motivation: z.string().min(20, "Please describe your motivation (min 20 characters)"),
  availability: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  preferredContact: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
})

export async function submitTalentApplication(fd: FormData) {
  const session = await auth()
  const parsed = schema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) redirect(`/talent/apply?error=${encodeURIComponent(parsed.error.issues[0].message)}`)

  const d = parsed.data
  let userId = session?.user?.id
  const isNewApplicant = !userId

  if (userId) {
    const existing = await db.talentApplication.findUnique({ where: { userId } })
    if (existing) redirect("/talent/dashboard")
  } else {
    if (!d.password || d.password.length < 8) {
      redirect("/talent/apply?error=Password%20must%20be%20at%20least%208%20characters")
    }
    if (d.password !== d.confirmPassword) {
      redirect("/talent/apply?error=Passwords%20do%20not%20match")
    }
    const existingUser = await db.user.findUnique({ where: { email: d.email } })
    if (existingUser) {
      redirect(`/login?next=/talent/apply&error=${encodeURIComponent("An account already exists for this email. Please sign in to apply.")}`)
    }

    const hashed = await bcrypt.hash(d.password, 12)
    const user = await db.user.create({
      data: {
        email: d.email,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone || null,
        password: hashed,
        role: "TALENT_APPLICANT",
      },
      select: { id: true },
    })
    userId = user.id
  }

  await db.talentApplication.create({
    data: {
      reference: generateTalentRef(),
      userId,
      program: d.program,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || null,
      ageRange: d.ageRange || null,
      gender: d.gender || null,
      location: d.location || null,
      applicantCategory: d.applicantCategory as any,
      talentArea: d.talentArea as any,
      experienceDesc: d.experienceDesc,
      motivation: d.motivation,
      availability: d.availability || null,
      accessibilityNeeds: d.accessibilityNeeds || null,
      preferredContact: d.preferredContact || null,
    } as any,
  })

  if (!isNewApplicant) {
    await db.user.update({
      where: { id: userId },
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone || null,
        role: "TALENT_APPLICANT",
      },
    })
  }

  revalidatePath("/talent/dashboard")
  if (isNewApplicant) {
    await signIn("credentials", {
      email: d.email,
      password: d.password,
      redirectTo: "/talent/dashboard",
    })
  }
  redirect("/talent/dashboard")
}
