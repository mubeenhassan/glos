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

export default function ProjectDetailAnimations() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.project-detail-page')
    if (!page || hasReducedMotionPreference()) {
      return
    }

    const ctx = gsap.context(() => {
      const titleWords = gsap.utils.toArray<HTMLElement>('.js-project-title-word', page)
      const breadcrumb = page.querySelector<HTMLElement>('.js-project-breadcrumb')
      const introItems = gsap.utils.toArray<HTMLElement>('.js-project-intro-item', page)
      const detailsCard = page.querySelector<HTMLElement>('.js-project-details-card')
      const detailRows = gsap.utils.toArray<HTMLElement>('.js-project-detail-row', page)
      const heroWrap = page.querySelector<HTMLElement>('.js-project-hero-media')
      const heroImage = page.querySelector<HTMLElement>('.js-project-hero-image')
      const thumbs = gsap.utils.toArray<HTMLElement>('.js-project-thumb', page)
      const productsHeading = page.querySelector<HTMLElement>('.js-products-heading')
      const productCards = gsap.utils.toArray<HTMLElement>('.js-product-card', page)
      const productImages = gsap.utils.toArray<HTMLElement>('.js-product-image', page)
      const productCaptions = gsap.utils.toArray<HTMLElement>('.js-product-caption', page)

      gsap.set(titleWords, {yPercent: 112})
      gsap.set(compactElements([breadcrumb]), {autoAlpha: 0, y: 16})
      gsap.set(introItems, {autoAlpha: 0, y: 28})
      gsap.set(compactElements([detailsCard]), {
        autoAlpha: 0,
        clipPath: 'inset(16% 0% 16% 0% round 10px)',
        scale: 0.97,
        transformOrigin: '50% 50%',
      })
      gsap.set(detailRows, {autoAlpha: 0, x: 18})

      const introReveal = gsap.timeline({defaults: {ease: 'power4.out'}})
      introReveal
        .to(titleWords, {yPercent: 0, duration: 1.0, stagger: {amount: 0.28}}, 0)
        .to(compactElements([breadcrumb]), {autoAlpha: 1, y: 0, duration: 0.58}, 0.16)
        .to(introItems, {autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.09}, 0.32)
        .to(
          compactElements([detailsCard]),
          {
            autoAlpha: 1,
            clipPath: 'inset(0% 0% 0% 0% round 10px)',
            scale: 1,
            duration: 0.86,
            ease: 'expo.out',
          },
          0.42,
        )
        .to(detailRows, {autoAlpha: 1, x: 0, duration: 0.58, stagger: 0.06}, 0.68)

      if (heroWrap && heroImage) {
        gsap.set(heroWrap, {
          clipPath: 'inset(0% 0% 100% 0% round 10px)',
          autoAlpha: 0,
        })
        gsap.set(heroImage, {scale: 1.12, yPercent: -3, transformOrigin: '50% 50%'})

        gsap
          .timeline({
            scrollTrigger: {
              trigger: heroWrap,
              start: 'top 78%',
              once: true,
            },
            defaults: {ease: 'expo.out'},
          })
          .to(heroWrap, {
            autoAlpha: 1,
            clipPath: 'inset(0% 0% 0% 0% round 10px)',
            duration: 1.18,
          })
          .to(heroImage, {scale: 1, yPercent: 0, duration: 1.35}, 0.06)
      }

      if (thumbs.length > 0) {
        gsap.set(thumbs, {
          autoAlpha: 0,
          y: 30,
          scale: 0.94,
          clipPath: 'inset(12% 12% 12% 12% round 8px)',
        })

        gsap.to(thumbs, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0% round 8px)',
          duration: 0.88,
          stagger: {amount: 0.24, from: 'center'},
          ease: 'expo.out',
          scrollTrigger: {
            trigger: thumbs[0],
            start: 'top 82%',
            once: true,
          },
        })
      }

      if (productCards.length > 0) {
        gsap.set(compactElements([productsHeading]), {autoAlpha: 0, y: 26})
        gsap.set(productCards, {
          autoAlpha: 0,
          y: 54,
          scale: 0.96,
          clipPath: 'inset(8% 8% 8% 8% round 10px)',
        })
        gsap.set(productImages, {scale: 1.1, transformOrigin: '50% 50%'})
        gsap.set(productCaptions, {autoAlpha: 0, y: 18})

        const productsReveal = gsap.timeline({
          scrollTrigger: {
            trigger: productCards[0],
            start: 'top 84%',
            once: true,
          },
          defaults: {ease: 'power4.out'},
        })

        productsReveal
          .to(compactElements([productsHeading]), {autoAlpha: 1, y: 0, duration: 0.65}, 0)
          .to(
            productCards,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: 'inset(0% 0% 0% 0% round 10px)',
              duration: 0.92,
              stagger: {amount: 0.24},
              ease: 'expo.out',
            },
            0.1,
          )
          .to(productImages, {scale: 1, duration: 1.1, stagger: 0.05, ease: 'expo.out'}, 0.18)
          .to(productCaptions, {autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.06}, 0.38)

        if (window.matchMedia('(min-width: 768px)').matches) {
          productImages.forEach((image) => {
            gsap.to(image, {
              yPercent: -6,
              ease: 'none',
              scrollTrigger: {
                trigger: image,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            })
          })
        }
      }
    }, page)

    return () => ctx.revert()
  }, [])

  return null
}
