'use client'

import {useEffect} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function compact(elements: Array<HTMLElement | null | undefined>) {
  return elements.filter((element): element is HTMLElement => Boolean(element))
}

export default function ProductDetailAnimations() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.product-detail-page')
    if (!page || prefersReducedMotion()) {
      return
    }

    const ctx = gsap.context(() => {
      const heroLabel = page.querySelector<HTMLElement>('.js-pdp-hero-label')
      const breadcrumb = page.querySelector<HTMLElement>('.js-pdp-breadcrumb')
      const heroMedia = page.querySelector<HTMLElement>('.js-pdp-hero-media')
      const heroImage = page.querySelector<HTMLElement>('.js-pdp-hero-image')
      const thumbs = gsap.utils.toArray<HTMLElement>('.js-pdp-thumb', page)
      const introItems = gsap.utils.toArray<HTMLElement>('.js-pdp-intro-item', page)
      const tabs = page.querySelector<HTMLElement>('.js-pdp-tabs')
      const tabLinks = gsap.utils.toArray<HTMLElement>('.js-pdp-tab', page)
      const tabPanel = page.querySelector<HTMLElement>('.js-pdp-tab-panel')
      const features = gsap.utils.toArray<HTMLElement>('.js-pdp-feature', page)
      const featureImages = gsap.utils.toArray<HTMLElement>('.js-pdp-feature-image', page)
      const relatedSection = page.querySelector<HTMLElement>('.js-pdp-related')
      const relatedCards = gsap.utils.toArray<HTMLElement>('.js-pdp-related-card', page)

      if (heroLabel) {
        gsap.set(heroLabel, {
          autoAlpha: 0,
          y: 44,
          clipPath: 'inset(100% 0% 0% 0%)',
        })
      }

      gsap.set(compact([breadcrumb]), {autoAlpha: 0, y: 14})
      gsap.set(introItems, {autoAlpha: 0, y: 26})
      gsap.set(compact([tabs]), {autoAlpha: 0, y: 16})
      gsap.set(tabLinks, {autoAlpha: 0, y: 10})

      const intro = gsap.timeline({defaults: {ease: 'power3.out'}})

      intro
        .to(
          heroLabel,
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.92,
            ease: 'expo.out',
          },
          0,
        )
        .to(compact([breadcrumb]), {autoAlpha: 1, y: 0, duration: 0.55}, 0.18)
        .to(introItems, {autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.08}, 0.28)

      if (heroMedia && heroImage) {
        gsap.set(heroMedia, {
          autoAlpha: 0,
          clipPath: 'inset(0% 100% 0% 0% round 8px)',
        })
        gsap.set(heroImage, {scale: 1.1, transformOrigin: '50% 50%'})

        intro
          .to(
            heroMedia,
            {
              autoAlpha: 1,
              clipPath: 'inset(0% 0% 0% 0% round 8px)',
              duration: 0.88,
              ease: 'power4.inOut',
            },
            0.12,
          )
          .to(heroImage, {scale: 1, duration: 1.1, ease: 'power2.out'}, 0.2)
      }

      if (thumbs.length > 0) {
        gsap.set(thumbs, {autoAlpha: 0, y: 16, scale: 0.94})
        intro.to(
          thumbs,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.07,
            ease: 'back.out(1.4)',
          },
          0.55,
        )
      }

      intro
        .to(compact([tabs]), {autoAlpha: 1, y: 0, duration: 0.5}, 0.62)
        .to(tabLinks, {autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.05}, 0.68)

      if (tabPanel) {
        gsap.set(tabPanel, {autoAlpha: 0, y: 20})
        gsap.to(tabPanel, {
          scrollTrigger: {
            trigger: tabPanel,
            start: 'top 88%',
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: 'power2.out',
        })
      }

      if (features.length > 0) {
        gsap.set(features, {autoAlpha: 0, y: 36})
        gsap.set(featureImages, {scale: 1.08, transformOrigin: '50% 50%'})

        gsap.to(features, {
          scrollTrigger: {
            trigger: features[0],
            start: 'top 84%',
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.14,
          ease: 'power3.out',
        })

        featureImages.forEach((image) => {
          gsap.to(image, {
            scrollTrigger: {
              trigger: image,
              start: 'top 86%',
              once: true,
            },
            scale: 1,
            duration: 1.05,
            ease: 'power2.out',
          })
        })
      }

      if (relatedSection && relatedCards.length > 0) {
        gsap.set(relatedSection.querySelector('.js-pdp-related-heading'), {
          autoAlpha: 0,
          y: 24,
        })
        gsap.set(relatedCards, {autoAlpha: 0, y: 28, scale: 0.94})

        const relatedTl = gsap.timeline({
          scrollTrigger: {
            trigger: relatedSection,
            start: 'top 85%',
            once: true,
          },
        })

        relatedTl
          .to(relatedSection.querySelector('.js-pdp-related-heading'), {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            ease: 'power3.out',
          })
          .to(
            relatedCards,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.68,
              stagger: 0.08,
              ease: 'power3.out',
            },
            '-=0.28',
          )
      }
    }, page)

    return () => ctx.revert()
  }, [])

  return null
}
