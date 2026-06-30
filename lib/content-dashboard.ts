import { db } from "@/lib/db"
import { cache } from "react"

function buildDailyCount(items: { updatedAt: Date }[]): { date: string; count: number }[] {
  const map: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    map[d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })] = 0
  }
  items.forEach(item => {
    const key = item.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    if (key in map) map[key]++
  })
  return Object.entries(map).map(([date, count]) => ({ date, count }))
}

export const getContentDashboardData = cache(async () => {
  const [
    totalExperiences, publishedExperiences,
    totalBlogPosts, publishedBlogPosts,
    pendingReviews, approvedReviews,
    pendingTestimonials,
    publishedTalentProfiles, pendingTalentApplications,
    recentlyUpdatedContent,
    recentActivity,
    blogByCategory,
    recentPublishedPosts,
  ] = await Promise.all([
    db.experience.count(),
    db.experience.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count(),
    db.blogPost.count({ where: { published: true } }),
    db.review.count({ where: { approved: false } }),
    db.review.count({ where: { approved: true } }),
    db.testimonial.count({ where: { published: false } }),
    db.talentProfile.count({ where: { published: true } }),
    db.talentApplication.count({ where: { status: "PENDING" } }),
    Promise.all([
      db.experience.findMany({ take: 3, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, status: true, updatedAt: true, primaryImageUrl: true } }),
      db.blogPost.findMany({ take: 3, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, published: true, updatedAt: true, featuredImageUrl: true, category: true } }),
    ]),
    db.auditLog.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      where: { entityType: { in: ["Product", "Experience", "BlogPost", "Review", "TalentProfile", "TalentApplication"] } },
      select: { id: true, eventType: true, entityType: true, entityId: true, details: true, actorEmail: true, createdAt: true },
    }),
    db.blogPost.groupBy({ by: ["category"], _count: { _all: true }, where: { published: true } }),
    db.blogPost.findMany({
      where: { published: true, updatedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      select: { updatedAt: true },
      orderBy: { updatedAt: "asc" },
    }),
  ])

  const allRecent = [
    ...recentlyUpdatedContent[0].map(e => ({ id: e.id, type: "Experience" as const, title: e.title, status: e.status, updatedAt: e.updatedAt, imageUrl: e.primaryImageUrl })),
    ...recentlyUpdatedContent[1].map(b => ({ id: b.id, type: "BlogPost" as const, title: b.title, status: b.published ? "PUBLISHED" : "DRAFT", updatedAt: b.updatedAt, imageUrl: b.featuredImageUrl, category: b.category ?? undefined })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 8)

  return {
    kpis: { totalExperiences, publishedExperiences, totalBlogPosts, publishedBlogPosts, pendingReviews, approvedReviews, pendingTestimonials, publishedTalentProfiles, pendingTalentApplications },
    recentlyUpdatedContent: allRecent,
    recentActivity,
    charts: {
      blogByCategory: blogByCategory.map(b => ({ category: b.category ?? "OTHER", count: b._count._all })),
      recentPublished: buildDailyCount(recentPublishedPosts),
    },
  }
})

export type ContentDashboardData = Awaited<ReturnType<typeof getContentDashboardData>>
