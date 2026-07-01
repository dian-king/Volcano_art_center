import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const STORY_CONTENT = `
<p>The twin peaks of the Virunga Massif rise above the mist at dawn, their silhouettes unchanged for millions of years. But the forests that clothe their slopes — the forests that shelter the world's remaining mountain gorillas — are not as permanent as the volcanoes themselves.</p>

<p>At Volcano Arts Center, we sit at the foot of these mountains. Every morning, our artisans, teachers, and students look up at the same landscape that has defined Rwandan identity for centuries. That view is not just beautiful — it is our responsibility.</p>

<h2>Why the Buffer Zone Matters</h2>

<p>Between the national park boundary and the communities where our people live lies the buffer zone — a narrow ribbon of land that makes or breaks the gorilla's future. When it shrinks, gorillas venture into farmland. Conflict follows. When it is healthy, it acts as a living corridor, allowing gorillas to move, eat, and thrive.</p>

<p>The Virunga Reforestation 2025 campaign is our answer to that challenge. Our goal: plant 10,000 indigenous trees along the buffer zone, chosen specifically to provide food sources for mountain gorillas and nesting habitat for the Albertine Rift's endemic bird species.</p>

<h2>Communities as Conservationists</h2>

<img src="/images/WhatsApp Image 2026-06-30 at 8.51.32 PM (1).jpeg" alt="Community members near the Virunga buffer zone" />

<p>Conservation cannot happen without the people who live closest to the land. The families you see in these photographs — the elders sorting grain, the young men carrying goods along the mountain paths, the children who smile in front of the volcano — these are the true stewards of this ecosystem.</p>

<p>Every tree planted is planted by local hands. Every seedling is grown in nurseries run by community members who earn a wage through this programme. The mountain gorilla's survival and the community's livelihood are not in competition — they are the same goal.</p>

<h2>Art as a Bridge</h2>

<img src="/images/WhatsApp Image 2026-06-30 at 8.51.29 PM (1).jpeg" alt="Child drawing a gorilla portrait at Volcano Arts Center" />

<p>At VAC, we believe that you protect what you love, and you love what you understand. That is why our talent programme teaches children to draw the gorilla — not as an abstract symbol, but as a face with eyes and expression and life. A child who has spent hours drawing that face will never see a gorilla as anything but precious.</p>

<p>The wood carver you see shaping gorilla figures from raw timber is not just making a product to sell. He is practising an act of devotion — rendering in wood the animal that defines his landscape, his culture, and his economy.</p>

<h2>The Twin Volcanoes Watch Over Us</h2>

<img src="/images/WhatsApp Image 2026-06-30 at 8.51.34 PM (1).jpeg" alt="Twin volcanoes of the Virunga range at sunset" />

<p>Mount Bisoke and Mount Karisimbi have watched human civilisation come and go. They will outlast all of us. But the gorillas that shelter in their forests, the birds that nest in their canopy, the ferns that carpet their lower slopes — these are not eternal. They depend on choices made right now, in this generation.</p>

<p>The $23,400 raised so far by 312 donors will plant thousands of trees. But the campaign's goal of $50,000 would plant every one of those 10,000 trees and fund two years of community maintenance — ensuring that what is planted actually survives.</p>

<h2>How You Can Help</h2>

<p>Every contribution, no matter the size, becomes a tree on a Rwandan mountainside. Every tree is a meal for a gorilla family. Every gorilla family that thrives is a story that continues.</p>

<p>Support the Virunga Reforestation 2025 campaign and become part of the landscape that made this place extraordinary.</p>
`.trim()

async function main() {
  // 1. Update the featured campaign with the volcano image
  const campaign = await db.conservationCampaign.findFirst({
    where: { featured: true, status: "ACTIVE" },
  })

  if (campaign) {
    await db.conservationCampaign.update({
      where: { id: campaign.id },
      data: {
        imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.34 PM (1).jpeg",
      },
    })
    console.log(`✓ Campaign image updated: ${campaign.name}`)
  } else {
    console.log("⚠ No featured active campaign found")
  }

  // 2. Create the conservation blog post
  const existing = await db.blogPost.findUnique({
    where: { slug: "guardians-of-virunga-rwanda-mountain-gorillas" },
  })

  if (existing) {
    await db.blogPost.update({
      where: { slug: "guardians-of-virunga-rwanda-mountain-gorillas" },
      data: {
        content: STORY_CONTENT,
        featuredImageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.34 PM (1).jpeg",
        published: true,
        publishedAt: new Date(),
      },
    })
    console.log("✓ Blog post updated")
  } else {
    await db.blogPost.create({
      data: {
        title: "Guardians of the Virunga: How Rwanda Protects Its Mountain Gorillas",
        slug: "guardians-of-virunga-rwanda-mountain-gorillas",
        excerpt: "At the foot of the Virunga Massif, every tree planted and every child taught to draw a gorilla is an act of conservation. Here is why the buffer zone matters — and what VAC is doing about it.",
        content: STORY_CONTENT,
        category: "CONSERVATION",
        tags: ["gorillas", "virunga", "conservation", "reforestation", "rwanda"],
        featuredImageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.34 PM (1).jpeg",
        featured: true,
        published: true,
        publishedAt: new Date(),
      },
    })
    console.log("✓ Blog post created")
  }

  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
