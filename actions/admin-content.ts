"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CONTENT_ROLES, OPS_ROLES, SUPER_ROLES, requireRole } from "@/lib/permissions"
import { sendBookingApprovedEmail, sendBookingRejectedEmail, sendOrderStatusEmail } from "@/lib/transactional-email"

async function getRole() {
  const s = await auth()
  return s?.user?.role as string | undefined
}

function requiredText(fd: FormData, key: string, label: string) {
  const value = fd.get(key)
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`)
  }
  return value.trim()
}

function slug(name: string) {
  const value = name.trim()
  if (!value) throw new Error("A title or name is required to create a slug.")
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
async function uniqueSlug(base: string, model: "product" | "experience" | "blogPost" | "conservationCampaign", excludeId?: string) {
  let s = slug(base), n = 0
  while (true) {
    const candidate = n === 0 ? s : `${s}-${n}`
    // @ts-ignore
    const existing = await (db[model] as any).findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n++
  }
}

// ─── EXPERIENCES ────────────────────────────────────────────────────────────

export async function createExperience(fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  const title = requiredText(fd, "title", "Experience title")
  const sl = await uniqueSlug(title, "experience")

  await db.experience.create({
    data: {
      title, slug: sl,
      shortDescription: (fd.get("shortDescription") as string) || null,
      description: (fd.get("description") as string) || null,
      location: (fd.get("location") as string) || null,
      durationHours: fd.get("durationHours") ? parseFloat(fd.get("durationHours") as string) : null,
      pricePerPerson: fd.get("pricePerPerson") ? parseFloat(fd.get("pricePerPerson") as string) : null,
      minGroupSize: parseInt(fd.get("minGroupSize") as string) || 1,
      maxGroupSize: parseInt(fd.get("maxGroupSize") as string) || 10,
      categoryId: (fd.get("categoryId") as string) || null,
      bookingType: (fd.get("bookingType") as any) || "DIRECT",
      status: (fd.get("status") as any) || "DRAFT",
      featured: fd.get("featured") === "on",
      primaryImageUrl: (fd.get("primaryImageUrl") as string) || null,
      meetingPoint: (fd.get("meetingPoint") as string) || null,
      languages: (fd.get("languages") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      included: (fd.get("included") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      excluded: (fd.get("excluded") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      whatToBring: (fd.get("whatToBring") as string || "").split(",").map(s => s.trim()).filter(Boolean),
    },
  })
  revalidatePath("/experiences"); revalidatePath("/admin/experiences")
  redirect("/admin/experiences")
}

export async function updateExperience(id: string, fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  await db.experience.update({
    where: { id },
    data: {
      title: fd.get("title") as string,
      shortDescription: (fd.get("shortDescription") as string) || null,
      description: (fd.get("description") as string) || null,
      location: (fd.get("location") as string) || null,
      durationHours: fd.get("durationHours") ? parseFloat(fd.get("durationHours") as string) : null,
      pricePerPerson: fd.get("pricePerPerson") ? parseFloat(fd.get("pricePerPerson") as string) : null,
      minGroupSize: parseInt(fd.get("minGroupSize") as string) || 1,
      maxGroupSize: parseInt(fd.get("maxGroupSize") as string) || 10,
      categoryId: (fd.get("categoryId") as string) || null,
      bookingType: fd.get("bookingType") as any,
      status: fd.get("status") as any,
      featured: fd.get("featured") === "on",
      primaryImageUrl: (fd.get("primaryImageUrl") as string) || null,
      meetingPoint: (fd.get("meetingPoint") as string) || null,
      languages: (fd.get("languages") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      included: (fd.get("included") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      excluded: (fd.get("excluded") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      whatToBring: (fd.get("whatToBring") as string || "").split(",").map(s => s.trim()).filter(Boolean),
    },
  })
  revalidatePath("/experiences"); revalidatePath("/admin/experiences")
  redirect("/admin/experiences")
}

// ─── CONSERVATION ────────────────────────────────────────────────────────────

export async function createCampaign(fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  const name = requiredText(fd, "name", "Campaign name")
  const sl = await uniqueSlug(name, "conservationCampaign")

  await db.conservationCampaign.create({
    data: {
      name, slug: sl,
      description: (fd.get("description") as string) || null,
      impactStatement: (fd.get("impactStatement") as string) || null,
      goalAmount: parseFloat(fd.get("goalAmount") as string) || 0,
      imageUrl: (fd.get("imageUrl") as string) || null,
      status: (fd.get("status") as any) || "ACTIVE",
      featured: fd.get("featured") === "on",
    },
  })
  revalidatePath("/conservation"); revalidatePath("/admin/conservation")
  redirect("/admin/conservation")
}

export async function updateCampaign(id: string, fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  await db.conservationCampaign.update({
    where: { id },
    data: {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || null,
      impactStatement: (fd.get("impactStatement") as string) || null,
      goalAmount: parseFloat(fd.get("goalAmount") as string) || 0,
      imageUrl: (fd.get("imageUrl") as string) || null,
      status: fd.get("status") as any,
      featured: fd.get("featured") === "on",
    },
  })
  revalidatePath("/conservation"); revalidatePath("/admin/conservation")
  redirect("/admin/conservation")
}

// ─── BLOG ───────────────────────────────────────────────────────────────────

export async function createPost(fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  const title = requiredText(fd, "title", "Post title")
  const sl = await uniqueSlug(title, "blogPost")
  const published = fd.get("published") === "on"

  await db.blogPost.create({
    data: {
      title, slug: sl,
      excerpt: (fd.get("excerpt") as string) || null,
      content: fd.get("content") as string,
      category: (fd.get("category") as any) || "STORY",
      featuredImageUrl: (fd.get("featuredImageUrl") as string) || null,
      seoTitle: (fd.get("seoTitle") as string) || null,
      seoDesc: (fd.get("seoDesc") as string) || null,
      featured: fd.get("featured") === "on",
      published,
      publishedAt: published ? new Date() : null,
      tags: (fd.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean),
    },
  })
  revalidatePath("/blog"); revalidatePath("/admin/blog")
  redirect("/admin/blog")
}

export async function updatePost(id: string, fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  const published = fd.get("published") === "on"
  const current = await db.blogPost.findUnique({ where: { id }, select: { publishedAt: true, published: true } })

  await db.blogPost.update({
    where: { id },
    data: {
      title: fd.get("title") as string,
      excerpt: (fd.get("excerpt") as string) || null,
      content: fd.get("content") as string,
      category: fd.get("category") as any,
      featuredImageUrl: (fd.get("featuredImageUrl") as string) || null,
      seoTitle: (fd.get("seoTitle") as string) || null,
      seoDesc: (fd.get("seoDesc") as string) || null,
      featured: fd.get("featured") === "on",
      published,
      publishedAt: published && !current?.publishedAt ? new Date() : current?.publishedAt ?? null,
      tags: (fd.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean),
    },
  })
  revalidatePath("/blog"); revalidatePath("/admin/blog")
  redirect("/admin/blog")
}

// ─── TALENT PROFILES ─────────────────────────────────────────────────────────

export async function createTalentProfile(fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  await db.talentProfile.create({
    data: {
      userId: fd.get("userId") as string,
      displayName: requiredText(fd, "displayName", "Display name"),
      bio: (fd.get("bio") as string) || null,
      talentArea: fd.get("talentArea") as any,
      category: fd.get("category") as any,
      imageUrl: (fd.get("imageUrl") as string) || null,
      published: fd.get("published") === "on",
      featured: fd.get("featured") === "on",
    },
  })
  revalidatePath("/talent"); revalidatePath("/admin/talent")
  redirect("/admin/talent")
}

export async function updateTalentProfile(id: string, fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  await db.talentProfile.update({
    where: { id },
    data: {
      displayName: fd.get("displayName") as string,
      bio: (fd.get("bio") as string) || null,
      talentArea: fd.get("talentArea") as any,
      category: fd.get("category") as any,
      imageUrl: (fd.get("imageUrl") as string) || null,
      published: fd.get("published") === "on",
      featured: fd.get("featured") === "on",
    },
  })
  revalidatePath("/talent"); revalidatePath("/admin/talent")
  redirect("/admin/talent")
}

// ─── REVIEWS ────────────────────────────────────────────────────────────────

export async function toggleReviewApproved(id: string, approved: boolean) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.review.update({ where: { id }, data: { approved } })
  revalidatePath("/admin/reviews")
}

export async function toggleReviewFeatured(id: string, featured: boolean) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.review.update({ where: { id }, data: { featured } })
  revalidatePath("/admin/reviews")
}

// ─── OPS: BOOKINGS ──────────────────────────────────────────────────────────

export async function updateBookingStatus(id: string, status: string, note?: string) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  const result = await db.$transaction(async (tx) => {
    const current = await tx.booking.findUnique({
      where: { id },
      select: { status: true, slotId: true, groupSize: true },
    })
    if (!current) throw new Error("Booking not found")

    const nextStatus = status as any
    const booking = await tx.booking.update({
      where: { id },
      data: {
        status: nextStatus,
        adminNote: note || null,
        cancelReason: ["REJECTED", "CANCELLED"].includes(status) ? note || "No reason provided" : null,
      },
      include: { experience: { select: { title: true } } },
    })

    if (
      current.slotId &&
      ["REJECTED", "CANCELLED"].includes(status) &&
      !["REJECTED", "CANCELLED"].includes(current.status)
    ) {
      await tx.availabilitySlot.update({
        where: { id: current.slotId },
        data: { booked: { decrement: current.groupSize } },
      })
    }

    return { previousStatus: current.status, booking }
  })
  if (result.previousStatus !== status) {
    const emailPayload = {
      reference: result.booking.reference,
      guestName: result.booking.guestName,
      guestEmail: result.booking.guestEmail,
      preferredDate: result.booking.preferredDate,
      groupSize: result.booking.groupSize,
      experienceTitle: result.booking.experience.title,
      note,
    }
    if (status === "CONFIRMED") await sendBookingApprovedEmail(emailPayload)
    if (status === "REJECTED") await sendBookingRejectedEmail(emailPayload)
  }
  revalidatePath("/admin/bookings")
}

// ─── OPS: ORDERS ────────────────────────────────────────────────────────────

export async function updateOrderStatus(id: string, fd: FormData) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  const current = await db.order.findUnique({ where: { id }, select: { status: true } })
  const order = await db.order.update({
    where: { id },
    data: {
      status: fd.get("status") as any,
      trackingNumber: (fd.get("trackingNumber") as string) || null,
      carrier: (fd.get("carrier") as string) || null,
    },
    include: {
      user: { select: { email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })
  if (current?.status !== order.status) {
    await sendOrderStatusEmail({
      reference: order.reference,
      customerEmail: order.user.email,
      recipientName: order.recipientName,
      total: Number(order.total),
      status: order.status,
      items: order.items.map(item => item.product.name),
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
    })
  }
  revalidatePath("/admin/orders")
}

// ─── OPS: APPLICATIONS ──────────────────────────────────────────────────────

export async function updateApplicationStatus(id: string, status: string, feedback?: string) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.talentApplication.update({
    where: { id },
    data: { status: status as any, staffFeedback: feedback || null },
  })
  revalidatePath("/admin/applications")
}

// ─── OPS: INQUIRIES ─────────────────────────────────────────────────────────

export async function updateInquiryStatus(id: string, status: string, note?: string) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.contactInquiry.update({
    where: { id },
    data: { status: status as any, staffNote: note || null },
  })
  revalidatePath("/admin/inquiries")
}

// ─── OPS: SLOTS ─────────────────────────────────────────────────────────────

export async function createSlot(fd: FormData) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.availabilitySlot.create({
    data: {
      experienceId: fd.get("experienceId") as string,
      date: new Date(fd.get("date") as string),
      capacity: parseInt(fd.get("capacity") as string) || 10,
      status: (fd.get("status") as any) || "AVAILABLE",
      guideName: (fd.get("guideName") as string) || null,
      guideEmail: (fd.get("guideEmail") as string) || null,
    },
  })
  revalidatePath("/admin/slots")
  redirect("/admin/slots")
}

export async function updateSlotStatus(id: string, status: string) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.availabilitySlot.update({ where: { id }, data: { status: status as any } })
  revalidatePath("/admin/slots")
}

// ─── OPS: OPERATORS ─────────────────────────────────────────────────────────

export async function updateOperatorRequestStatus(id: string, status: string, note?: string) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.operatorRequest.update({
    where: { id },
    data: { status: status as any, adminNote: note || null },
  })
  revalidatePath("/admin/operators")
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.product.update({ where: { id }, data: { featured } })
  revalidatePath("/art-store"); revalidatePath("/admin/products")
}

export async function toggleExperienceFeatured(id: string, featured: boolean) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.experience.update({ where: { id }, data: { featured } })
  revalidatePath("/experiences"); revalidatePath("/admin/experiences")
}

export async function toggleBlogFeatured(id: string, featured: boolean) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.blogPost.update({ where: { id }, data: { featured } })
  revalidatePath("/blog"); revalidatePath("/admin/blog")
}

export async function toggleCampaignFeatured(id: string, featured: boolean) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.conservationCampaign.update({ where: { id }, data: { featured } })
  revalidatePath("/conservation"); revalidatePath("/admin/conservation")
}

export async function toggleTalentFeatured(id: string, featured: boolean) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.talentProfile.update({ where: { id }, data: { featured } })
  revalidatePath("/talent"); revalidatePath("/admin/talent")
}

// ─── DELETE ACTIONS ──────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  const role = await getRole()
  requireRole(role, OPS_ROLES)
  await db.product.delete({ where: { id } })
  revalidatePath("/art-store"); revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function deleteExperience(id: string) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.experience.delete({ where: { id } })
  revalidatePath("/experiences"); revalidatePath("/admin/experiences")
  redirect("/admin/experiences")
}

export async function deleteCampaign(id: string) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.conservationCampaign.delete({ where: { id } })
  revalidatePath("/conservation"); revalidatePath("/admin/conservation")
  redirect("/admin/conservation")
}

export async function deletePost(id: string) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.blogPost.delete({ where: { id } })
  revalidatePath("/blog"); revalidatePath("/admin/blog")
  redirect("/admin/blog")
}

export async function deleteTalentProfile(id: string) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)
  await db.talentProfile.delete({ where: { id } })
  revalidatePath("/talent"); revalidatePath("/admin/talent")
  redirect("/admin/talent")
}

// ─── SUPER: USERS ────────────────────────────────────────────────────────────

export async function updateUserRole(id: string, role: string) {
  const actorRole = await getRole()
  requireRole(actorRole, SUPER_ROLES)
  await db.user.update({ where: { id }, data: { role: role as any } })
  revalidatePath("/admin/users")
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const actorRole = await getRole()
  requireRole(actorRole, SUPER_ROLES)
  await db.user.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/users")
}
