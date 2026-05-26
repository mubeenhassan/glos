'use client'

import {useEffect} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GalleryAnimations() {
  useEffect(() => {
    const sections = document.querySelectorAll('.cms-gallery-section, .cms-projects-listing-section')
    if (sections.length === 0) return

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        // ── Title: word-split reveal (same feel as hero) ─────────────────────
        const titleWords = section.querySelectorAll('.gallery-word-inner')
        if (titleWords.length > 0) {
          gsap.set(titleWords, {yPercent: 115})

          ScrollTrigger.create({
            trigger: section.querySelector('h1, h2'),
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(titleWords, {
                yPercent: 0,
                duration: 1.1,
                stagger: {amount: 0.5, ease: 'power2.inOut'},
                ease: 'power4.out',
              })
            },
          })
        }

        // ── Gallery images: iris-expand from center ──────────────────────────
        // Each tile starts collapsed to its own centre point and opens outward.
        const items = section.querySelectorAll('.cms-gallery-item')
        if (items.length > 0) {
          const tileRadius = window.matchMedia('(min-width: 768px)').matches ? 18 : 10

          gsap.set(items, {
            clipPath: `inset(48% 48% 48% 48% round ${tileRadius}px)`,
            opacity: 0,
            scale: 0.86,
          })

          ScrollTrigger.create({
            trigger: section.querySelector('.cms-gallery-grid') || section,
            start: 'top 78%',
            once: true,
            onEnter: () => {
              gsap.to(items, {
                clipPath: `inset(0% 0% 0% 0% round ${tileRadius}px)`,
                opacity: 1,
                scale: 1,
                duration: 1.15,
                stagger: {
                  from: 'center',
                  amount: 0.72,
                  ease: 'power1.inOut',
                },
                ease: 'expo.out',
              })
            },
          })
        }
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
