"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const SLIDES = [
  { label: "Gorilla Trek",     bg: "#003D20", img: "/images/wide.jpeg"  },
  { label: "Highlands",        bg: "#1A3A28", img: "/images/WhatsApp Image 2026-06-30 at 8.51.33 PM (1).jpeg" },
  { label: "Art Studio",       bg: "#1B4332", img: "/images/wide2.jpeg" },
  { label: "Village Life",     bg: "#2D6A4F", img: "/images/wide3.jpeg" },
  { label: "Virunga",          bg: "#0F2D1C", img: "/images/WhatsApp Image 2026-06-30 at 8.51.35 PM.jpeg"     },
  { label: "Twin Peaks",       bg: "#1C4A30", img: "/images/WhatsApp Image 2026-06-30 at 8.51.34 PM (1).jpeg" },
  { label: "Art Store",        bg: "#3D1F00", img: "/images/WhatsApp Image 2026-06-30 at 8.51.41 PM.jpeg"     },
  { label: "Village Cooking",  bg: "#1A0F00", img: "/images/WhatsApp Image 2026-06-30 at 8.51.43 PM.jpeg"     },
  { label: "Grain Grinding",   bg: "#2A1800", img: "/images/WhatsApp Image 2026-06-30 at 8.51.59 PM.jpeg"     },
  { label: "Heritage Room",    bg: "#3A1500", img: "/images/WhatsApp Image 2026-06-30 at 8.52.04 PM (1).jpeg" },
]

const DURATION = 3000

export function HeroSection() {
  const [slide, setSlide]   = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSlide(p => (p + 1) % SLIDES.length)
    }, DURATION)
  }

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused])

  function goTo(i: number) {
    setSlide(i)
    if (!paused) startTimer()
  }

  return (
    <section
      className="home-hero"
      aria-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background slides ── */}
      <div className="home-hero__bg">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`home-hero__slide${slide === i ? " is-active" : ""}`}
            style={{ background: s.bg }}
          >
            <Image
              src={s.img}
              alt=""
              aria-hidden
              fill
              unoptimized
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center", opacity: 0.62 }}
            />
          </div>
        ))}
      </div>

      {/* ── Veil ── */}
      <div className="home-hero__veil" />

      {/* ── Content ── */}
      <div className="home-hero__inner">
        <div className="home-hero__copy container">
          <div className="home-hero__kicker">
            <div className="home-hero__kicker-accent" />
            <span>Rwanda&apos;s Premier Arts &amp; Culture Platform</span>
          </div>
          <h1 className="home-hero__title">
            Authentic Art, Culture &amp; Conservation — In the Heart of Africa
          </h1>
          <div className="home-hero__actions">
            <Link href="/art-store" className="btn btn--primary btn--lg">Shop Art</Link>
            <Link href="/experiences" className="btn btn--hero-ghost btn--lg">Book Experiences</Link>
          </div>
        </div>
      </div>

      {/* ── Gorilla ── */}
      <Image
        src="/images/gorilla.png"
        alt=""
        aria-hidden
        width={560}
        height={700}
        priority
        unoptimized
        className="home-hero__gorilla"
        style={{ objectFit: "contain" }}
      />

      {/* ── Location tag ── */}
      <div className="home-hero__footer">
        <div style={{ flex: 1 }} />
        <div className="home-hero__location" aria-hidden="true">
          <span className="home-hero__location-dot" />
          <span>Musanze · Rwanda</span>
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div className="home-hero__scroll-cue" aria-hidden="true">
        <div className="home-hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
