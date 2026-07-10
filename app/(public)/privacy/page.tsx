import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocument, type LegalSection } from "@/components/public/LegalDocument"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Volcano Arts Center Inc Rwanda collects, uses, and protects your personal information.",
}

const ul: React.CSSProperties = { listStyle: "disc", paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-2)" }

const sections: LegalSection[] = [
  {
    heading: "Information We Collect",
    body: (
      <>
        <p>We collect information you provide directly to us, including:</p>
        <ul style={ul}>
          <li><strong>Account information</strong> — your name, email address, phone number, and country when you register or apply.</li>
          <li><strong>Order and shipping details</strong> — recipient name, delivery address, and contact information when you place an order.</li>
          <li><strong>Donation and booking details</strong> — the information needed to process conservation donations and experience bookings.</li>
          <li><strong>Communications</strong> — messages you send us through contact forms or email.</li>
        </ul>
        <p style={{ marginTop: "var(--space-3)" }}>We do not store full payment card numbers. Mobile-money and bank transfers are confirmed manually by our team using a reference number.</p>
      </>
    ),
  },
  {
    heading: "How We Use Your Information",
    body: (
      <ul style={ul}>
        <li>To process and fulfil your orders, bookings, and donations.</li>
        <li>To communicate with you about your account, transactions, and requests.</li>
        <li>To send transactional emails such as order confirmations and booking updates.</li>
        <li>To operate, maintain, and improve our website and services.</li>
        <li>To comply with legal obligations.</li>
      </ul>
    ),
  },
  {
    heading: "Third-Party Services",
    body: (
      <>
        <p>We rely on trusted third parties to operate our platform. These providers process data only as needed to deliver their services:</p>
        <ul style={ul}>
          <li><strong>Hosting &amp; database</strong> — our website and data are hosted on secure cloud infrastructure.</li>
          <li><strong>Media storage</strong> — uploaded images and media are stored with a cloud media provider.</li>
          <li><strong>Google Sign-In</strong> — if you choose to sign in with Google, we receive your name and email address from Google.</li>
          <li><strong>Email delivery</strong> — transactional emails are sent through our mail provider.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Cookies",
    body: <p>We use essential cookies to keep you signed in, maintain your shopping cart, and remember your theme preference. These are necessary for the website to function and do not track you across other sites.</p>,
  },
  {
    heading: "Data Retention",
    body: <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements.</p>,
  },
  {
    heading: "Your Rights",
    body: (
      <>
        <p>You may request to access, correct, or delete your personal information at any time. To do so, contact us using the details below. We will respond within a reasonable timeframe.</p>
      </>
    ),
  },
  {
    heading: "Children's Privacy",
    body: <p>Our services are not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us information, please contact us and we will delete it.</p>,
  },
  {
    heading: "Changes to This Policy",
    body: <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>,
  },
  {
    heading: "Contact Us",
    body: (
      <p>
        If you have questions about this Privacy Policy or how we handle your data, please <Link href="/contact" style={{ color: "var(--green)" }}>contact us</Link> or email{" "}
        <a href="mailto:info@volcanoartscenterinc.org.rw" style={{ color: "var(--green)" }}>info@volcanoartscenterinc.org.rw</a>.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="10 July 2026"
      intro="Volcano Arts Center Inc Rwanda (“we”, “us”, “our”) respects your privacy and is committed to protecting your personal information. This policy explains what we collect, how we use it, and the choices you have."
      sections={sections}
    />
  )
}
