import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.volcanoartscenterinc.org.rw"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/client",
        "/talent/dashboard",
        "/tour-operators/portal",
        "/api",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/forgot-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
