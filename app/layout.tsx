import type { Metadata } from "next"
import { Cormorant_Garamond, Syne, DM_Sans, DM_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/ui/Providers"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--nf-cormorant",
  display: "swap",
})
const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--nf-syne",
  display: "swap",
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--nf-dmsans",
  display: "swap",
})
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--nf-dmmono",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "Volcano Arts Center Inc Rwanda", template: "%s | Volcano Arts Center Inc Rwanda" },
  description: "Premium Rwandan art, culture, and conservation platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        {/* No-FOUC theme script — must run before any paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vac-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
