'use client'

import {useEffect} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ImageCollageAnimations() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const sections = gsap.utils.toArray<HTMLElement>('.cms-collage-section')
    if (sections.length === 0) return

    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        const figures = gsap.utils.toArray<HTMLElement>('.js-collage-image', section)
        const images = gsap.utils.toArray<HTMLElement>('.js-collage-image img', section)
        const titleWords = gsap.utils.toArray<HTMLElement>('.collage-word-inner', section)
        const copyItems = gsap.utils.toArray<HTMLElement>('.js-collage-copy-item', section)

        if (titleWords.length > 0) {
          gsap.set(titleWords, {yPercent: 115})
        }

        if (copyItems.length > 0) {
          gsap.set(copyItems, {autoAlpha: 0, y: 28})
        }

        if (figures.length > 0) {
          gsap.set(figures, {
            autoAlpha: 0,
            clipPath: 'inset(18% 18% 18% 18% round 8px)',
            scale: 0.9,
            y: 40,
            transformOrigin: '50% 55%',
          })
        }

        if (images.length > 0) {
          gsap.set(images, {scale: 1.14, transformOrigin: '50% 50%'})
        }

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 76%',
            once: true,
          },
          defaults: {ease: 'power3.out'},
        })

        reveal
          .to(
            titleWords,
            {
              yPercent: 0,
              duration: 1.05,
              stagger: {amount: 0.42, ease: 'power2.inOut'},
              ease: 'power4.out',
            },
            0,
          )
          .to(
            figures,
            {
              autoAlpha: 1,
              clipPath: 'inset(0% 0% 0% 0% round 8px)',
              scale: 1,
              y: 0,
              duration: 1.2,
              stagger: {amount: 0.34, from: 'center'},
              ease: 'expo.out',
            },
            0.08,
          )
          .to(images, {scale: 1, duration: 1.45, ease: 'expo.out', stagger: 0.08}, 0.14)
          .to(copyItems, {autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12}, 0.38)
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
