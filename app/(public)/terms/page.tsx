import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocument, type LegalSection } from "@/components/public/LegalDocument"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of the Volcano Arts Center Inc Rwanda website.",
}

const sections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    body: <p>By accessing or using the Volcano Arts Center Inc Rwanda website, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>,
  },
  {
    heading: "Use of the Website",
    body: <p>You agree to use the website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the site. You are responsible for keeping your account credentials secure and for all activity under your account.</p>,
  },
  {
    heading: "Products and Orders",
    body: <p>We take care to display our artworks, prices, and availability accurately. However, we reserve the right to correct errors, update prices, and decline or cancel orders where necessary. Placing an order is an offer to purchase; a contract is formed once we confirm the order. Payment is confirmed manually by our team using your order reference.</p>,
  },
  {
    heading: "Experiences and Bookings",
    body: <p>Booking requests for cultural experiences are subject to availability and confirmation by our team. Prices are shown per person or per group as indicated. Cancellation and rescheduling terms will be communicated at the time of booking.</p>,
  },
  {
    heading: "Donations",
    body: <p>Conservation donations made through the site support our conservation and community programmes. Donations are voluntary and, unless otherwise stated, non-refundable once payment is confirmed.</p>,
  },
  {
    heading: "Pricing and Currency",
    body: <p>Prices are displayed in the currency shown for each item (USD or RWF). You are responsible for any taxes, duties, or transfer fees that may apply to your transaction.</p>,
  },
  {
    heading: "Intellectual Property",
    body: <p>All content on this website — including artwork images, text, logos, and designs — is the property of Volcano Arts Center Inc Rwanda or its artists and contributors, and is protected by applicable copyright and intellectual-property laws. You may not reproduce, distribute, or use this content without permission.</p>,
  },
  {
    heading: "Limitation of Liability",
    body: <p>The website and its content are provided “as is.” To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the site or its services.</p>,
  },
  {
    heading: "Governing Law",
    body: <p>These Terms are governed by the laws of the Republic of Rwanda. Any disputes shall be subject to the jurisdiction of the courts of Rwanda.</p>,
  },
  {
    heading: "Changes to These Terms",
    body: <p>We may update these Terms of Service from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.</p>,
  },
  {
    heading: "Contact Us",
    body: (
      <p>
        Questions about these Terms? Please <Link href="/contact" style={{ color: "var(--green)" }}>contact us</Link> or email{" "}
        <a href="mailto:info@volcanoartscenterinc.org.rw" style={{ color: "var(--green)" }}>info@volcanoartscenterinc.org.rw</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="10 July 2026"
      intro="These Terms of Service govern your use of the Volcano Arts Center Inc Rwanda website and the products, experiences, and services offered through it. Please read them carefully."
      sections={sections}
    />
  )
}
