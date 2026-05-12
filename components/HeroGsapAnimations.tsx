'use client'

import {useEffect} from 'react'
import gsap from 'gsap'

export default function HeroGsapAnimations() {
  useEffect(() => {
    // ── Set all initial animation states ─────────────────────────────────
    gsap.set('.brand', {opacity: 0, y: -28})
    gsap.set('.top-nav', {opacity: 0, y: -22, scale: 0.96})
    gsap.set('.top-search', {opacity: 0, y: -18})
    gsap.set('.top-search-placeholder', {opacity: 0})
    gsap.set('.hero-word-inner', {yPercent: 115})
    gsap.set('.cms-hero-action-column p', {opacity: 0, y: 38})
    gsap.set('.js-hero-cta-row', {opacity: 0, y: 26, scale: 0.97})

    const tl = gsap.timeline({
      defaults: {ease: 'power3.out'},
    })

    // ── Navbar sequence ──────────────────────────────────────────────────
    tl.to('.brand', {opacity: 1, y: 0, duration: 0.9}, 0.08)
    tl.to('.top-nav', {opacity: 1, y: 0, scale: 1, duration: 0.9}, 0.18)
    tl.to('.top-search', {opacity: 1, y: 0, duration: 0.75}, 0.28)
    tl.to('.top-search-placeholder', {opacity: 1, duration: 0.5}, 0.28)

    // ── Hero title words reveal ───────────────────────────────────────────
    tl.to(
      '.hero-word-inner',
      {
        yPercent: 0,
        duration: 1,
        stagger: {amount: 0.3, ease: 'power2.inOut'},
        ease: 'power4.out',
      },
      0.38,
    )

    // ── Description fade-up ──────────────────────────────────────────────
    tl.to(
      '.cms-hero-action-column p',
      {opacity: 1, y: 0, duration: 1, ease: 'power3.out'},
      0.88,
    )

    // ── CTA button spring-in ─────────────────────────────────────────────
    tl.to(
      '.js-hero-cta-row',
      {opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)'},
      1.1,
    )

    return () => {
      tl.kill()
      gsap.set(
        [
          '.brand',
          '.top-nav',
          '.top-search',
          '.top-search-placeholder',
          '.hero-word-inner',
          '.cms-hero-action-column p',
          '.js-hero-cta-row',
        ],
        {clearProps: 'all'},
      )
    }
  }, [])

  return null
}
