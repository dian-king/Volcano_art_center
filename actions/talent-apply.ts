"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateTalentRef } from "@/lib/references"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const schema = z.object({
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
})

export async function submitTalentApplication(fd: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be signed in" }

  // Check for existing application
  const existing = await db.talentApplication.findUnique({ where: { userId: session.user.id } })
  if (existing) return { error: "You have already submitted an application" }

  const parsed = schema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const d = parsed.data
  await db.talentApplication.create({
    data: {
      reference: generateTalentRef(),
      userId: session.user.id,
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
    },
  })

  // Upgrade role to TALENT_APPLICANT
  await db.user.update({ where: { id: session.user.id }, data: { role: "TALENT_APPLICANT" } })

  revalidatePath("/talent/dashboard")
  redirect("/talent/dashboard")
}
