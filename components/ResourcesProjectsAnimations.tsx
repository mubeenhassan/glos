'use client'

import {useEffect} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function hasReducedMotionPreference() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function compactElements(elements: Array<HTMLElement | null | undefined>) {
  return elements.filter((element): element is HTMLElement => Boolean(element))
}

export default function ResourcesProjectsAnimations() {
  useEffect(() => {
    if (hasReducedMotionPreference()) {
      return
    }

    const resourcesSections = gsap.utils.toArray<HTMLElement>('.cms-resources-learning-section')
    const projectSections = gsap.utils.toArray<HTMLElement>('.cms-featured-projects-section')

    if (resourcesSections.length === 0 && projectSections.length === 0) {
      return
    }

    const ctx = gsap.context(() => {
      resourcesSections.forEach((section) => {
        const heading = section.querySelector<HTMLElement>('.js-resources-heading')
        const cta = section.querySelector<HTMLElement>('.js-resources-cta')
        const copyItems = gsap.utils.toArray<HTMLElement>('.js-resources-copy-item', section)
        const targets = compactElements([heading, cta, ...copyItems])

        if (targets.length === 0) {
          return
        }

        gsap.set(targets, {autoAlpha: 0, y: 30})
        if (cta) {
          gsap.set(cta, {scale: 0.96})
        }

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            once: true,
          },
          defaults: {ease: 'power3.out'},
        })

        if (heading) {
          reveal.to(heading, {autoAlpha: 1, y: 0, duration: 0.9}, 0)
        }

        if (cta) {
          reveal.to(cta, {autoAlpha: 1, y: 0, scale: 1, duration: 0.72, ease: 'back.out(1.35)'}, 0.14)
        }

        if (copyItems.length > 0) {
          reveal.to(copyItems, {autoAlpha: 1, y: 0, duration: 0.82, stagger: 0.12}, 0.22)
        }
      })

      projectSections.forEach((section) => {
        const heading = section.querySelector<HTMLElement>('.js-featured-heading')
        const slider = section.querySelector<HTMLElement>('.js-featured-slider')
        const slides = gsap.utils.toArray<HTMLElement>('.js-featured-slide', section)
        const images = gsap.utils.toArray<HTMLElement>('.js-featured-image', section)
        const controls = gsap.utils.toArray<HTMLElement>('.js-featured-control', section)
        const cta = section.querySelector<HTMLElement>('.js-featured-cta')

        gsap.set(compactElements([heading, cta]), {autoAlpha: 0, y: 28})
        gsap.set(slides, {
          autoAlpha: 0,
          clipPath: 'inset(10% 10% 10% 10% round 8px)',
          scale: 0.95,
          y: 54,
          transformOrigin: '50% 65%',
        })
        gsap.set(images, {scale: 1.08, transformOrigin: '50% 50%'})
        gsap.set(controls, {autoAlpha: 0, y: 16})

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 76%',
            once: true,
          },
          defaults: {ease: 'power3.out'},
        })

        if (heading) {
          reveal.to(heading, {autoAlpha: 1, y: 0, duration: 0.85}, 0)
        }

        if (slides.length > 0) {
          reveal.to(
            slides,
            {
              autoAlpha: 1,
              clipPath: 'inset(0% 0% 0% 0% round 8px)',
              scale: 1,
              y: 0,
              duration: 1.05,
              stagger: {amount: 0.28, from: 'start'},
              ease: 'expo.out',
            },
            0.1,
          )
        }

        if (images.length > 0) {
          reveal.to(images, {scale: 1, duration: 1.2, ease: 'expo.out', stagger: 0.05}, 0.2)
        }

        if (controls.length > 0) {
          reveal.to(controls, {autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06}, 0.55)
        }

        if (cta) {
          reveal.to(cta, {autoAlpha: 1, y: 0, duration: 0.65}, 0.62)
        }

        if (slider && images.length > 0 && window.matchMedia('(min-width: 768px)').matches) {
          gsap.to(images, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: slider,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
            },
          })
        }
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
