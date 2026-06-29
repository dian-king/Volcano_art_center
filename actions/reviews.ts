"use server"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  reviewerName:    z.string().min(2, "Name is required"),
  reviewerCountry: z.string().optional(),
  rating:          z.coerce.number().int().min(1).max(5),
  comment:         z.string().min(10, "Please write at least 10 characters"),
})

export async function submitReview(formData: FormData) {
  const parsed = schema.safeParse({
    reviewerName:    formData.get("reviewerName"),
    reviewerCountry: formData.get("reviewerCountry"),
    rating:          formData.get("rating"),
    comment:         formData.get("comment"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  await db.review.create({
    data: {
      ...parsed.data,
      approved: false,  // must be approved by admin before showing
      featured: false,
    },
  })

  return { success: true }
}
