import Link from "next/link"
import { NewsletterForm } from "./NewsletterForm"

export function PublicFooter() {
  return (
    <footer className="site-footer site-footer--xl">
      <div className="site-footer__glow" aria-hidden="true" />

      {/* Top: brand col + link grid */}
      <div className="site-footer__top container">
        <div className="site-footer__brandcol">
          <Link href="/" className="site-footer__logo">
            <img src="/images/logo.png" alt="Volcano Arts Center Inc Rwanda" style={{ height: 60, width: "auto", display: "block" }} />
          </Link>

          <p className="site-footer__mission">
            Experience Rwanda through art, culture, and people. An international platform connecting
            collectors and travellers to authentic creativity near Volcanoes National Park.
          </p>

          <NewsletterForm />

          <div className="site-footer__social" aria-label="Social links">
            <a href="https://instagram.com/volcanoartsrwanda" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://facebook.com/volcanoartsrwanda" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://twitter.com/volcanoarts" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none" aria-hidden="true">
                <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.99L4.66 22H1.4l8.02-9.17L1 2h7.02l4.84 6.39zm-1.2 18h1.9L7.04 4H5.01z"/>
              </svg>
            </a>
            <a href="https://wa.me/250780000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Link columns — 5 columns using site-footer__links grid */}
        <div className="site-footer__links">
          <div className="site-footer__col">
            <h4>Explore</h4>
            <Link href="/art-store">Art Store</Link>
            <Link href="/experiences">Experiences</Link>
            <Link href="/conservation">Conservation</Link>
            <Link href="/talent">Talent &amp; Media</Link>
            <Link href="/blog">Blog &amp; Stories</Link>
          </div>
          <div className="site-footer__col">
            <h4>Visit Rwanda</h4>
            <Link href="/experiences?type=CULTURAL">Cultural Tours</Link>
            <Link href="/experiences?type=CONSERVATION">Gorilla &amp; Wildlife</Link>
            <Link href="/experiences?type=VILLAGE">Village Life</Link>
            <Link href="/experiences?type=CUSTOM">Custom Itineraries</Link>
            <Link href="/contact">Plan With Our Team</Link>
          </div>
          <div className="site-footer__col">
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/conservation">Our Impact</Link>
            <Link href="/talent/apply">Join the Talent Pipeline</Link>
            <Link href="/blog">Newsroom</Link>
          </div>
          <div className="site-footer__col">
            <h4>Support</h4>
            <Link href="/contact">Help &amp; FAQ</Link>
            <Link href="/contact">Shipping &amp; Returns</Link>
            <Link href="/client/dashboard/orders">Track an Order</Link>
            <Link href="/login">Account &amp; Sign In</Link>
            <Link href="/contact">Commission Art</Link>
          </div>
          <div className="site-footer__col site-footer__col--contact">
            <h4>Reach Us</h4>
            <a href="https://maps.google.com/?q=Volcano+Arts+%26+Hospes+GJQ7%2BP76+Musanze+Rwanda" target="_blank" rel="noopener" className="site-footer__contact">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>GJQ7+P76 · Musanze, Rwanda</span>
            </a>
            <a href="mailto:hello@volcanoartsandhospes.com" className="site-footer__contact">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>
              </svg>
              <span>hello@volcanoartsandhospes.com</span>
            </a>
            <a href="tel:+250780000000" className="site-footer__contact">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>
              </svg>
              <span>+250 780 000 000</span>
            </a>
          </div>
        </div>
      </div>

      {/* Assurance bar */}
      <div className="site-footer__assurance container">
        <span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Worldwide FedEx fulfilment
        </span>
        <span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          USD · EUR · RWF accepted
        </span>
        <span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Secure global checkout
        </span>
        <span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          English &amp; French support
        </span>
      </div>

      {/* Copyright bar */}
      <div className="site-footer__bar">
        <div className="container site-footer__bar-inner">
          <p>© 2026 <Link href="/" className="footer-brand">Volcano Arts Center Inc Rwanda</Link>. All rights reserved.</p>
          <div className="site-footer__legal">
            <Link href="/contact">Privacy</Link>
            <Link href="/contact">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
