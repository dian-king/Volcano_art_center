"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const SLIDES = [
  { label: "Gorilla Trek",  bg: "#003D20", img: "/images/wide.jpeg"  },
  { label: "Art Studio",    bg: "#1B4332", img: "/images/wide2.jpeg" },
  { label: "Village Life",  bg: "#2D6A4F", img: "/images/wide3.jpeg" },
  { label: "Culture",       bg: "#1C4A30", img: "/images/WhatsApp Image 2026-06-30 at 8.51.34 PM (1).jpeg" },
  { label: "Conservation",  bg: "#1C3A2A", img: "/images/WhatsApp Image 2026-06-30 at 8.51.36 PM.jpeg"      },
]

const DURATION = 5000

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
              priority={i < 2}
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

      {/* ── Bottom bar ── */}
      <div className="home-hero__footer">
        <nav className="home-hero__pips" aria-label="Slide controls">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              className={`home-hero__pip${i === slide ? " is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={s.label}
              aria-pressed={i === slide}
            >
              {/* key=slide forces remount → CSS animation restarts cleanly */}
              {i === slide && <span key={slide} className="home-hero__pip-fill" />}
            </button>
          ))}
        </nav>

        <span className="home-hero__counter" aria-hidden="true">
          <strong>{String(slide + 1).padStart(2, "0")}</strong>
          <span className="home-hero__counter-slash">/</span>
          <span>{String(SLIDES.length).padStart(2, "0")}</span>
        </span>

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
