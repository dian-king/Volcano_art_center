import { db } from "@/lib/db"
import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.volcanoartscenterinc.org.rw"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/art-store`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/experiences`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/conservation`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/talent`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/gallery`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/tour-operators/apply`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/talent/apply`, changeFrequency: "monthly", priority: 0.4 },
  ]

  const [products, experiences, campaigns, posts, talentProfiles] = await Promise.all([
    db.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.experience.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.conservationCampaign.findMany({ where: { status: "ACTIVE" }, select: { slug: true, createdAt: true } }),
    db.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.talentProfile.findMany({ where: { published: true }, select: { id: true, createdAt: true } }),
  ])

  return [
    ...staticRoutes,
    ...products.map(p => ({ url: `${BASE_URL}/art-store/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...experiences.map(e => ({ url: `${BASE_URL}/experiences/${e.slug}`, lastModified: e.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...campaigns.map(c => ({ url: `${BASE_URL}/conservation/${c.slug}`, lastModified: c.createdAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map(b => ({ url: `${BASE_URL}/blog/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...talentProfiles.map(t => ({ url: `${BASE_URL}/talent/${t.id}`, lastModified: t.createdAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ]
}
