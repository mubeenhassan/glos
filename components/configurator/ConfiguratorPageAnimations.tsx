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

export default function ConfiguratorPageAnimations() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.configurator-page')
    if (!page || prefersReducedMotion()) {
      return
    }

    const ctx = gsap.context(() => {
      const title = page.querySelector<HTMLElement>('.js-cfg-title')
      const breadcrumb = page.querySelector<HTMLElement>('.js-cfg-breadcrumb')
      const preview = page.querySelector<HTMLElement>('.js-cfg-preview')
      const previewImage = page.querySelector<HTMLElement>('.js-cfg-preview-image')
      const thumbs = gsap.utils.toArray<HTMLElement>('.js-cfg-preview-thumb', page)
      const sidebar = page.querySelector<HTMLElement>('.js-cfg-sidebar')
      const filterSections = gsap.utils.toArray<HTMLElement>(
        '.js-cfg-sidebar section',
        page,
      )
      const collectionModels = gsap.utils.toArray<HTMLElement>(
        '.js-cfg-collection-model',
        page,
      )
      const variants = gsap.utils.toArray<HTMLElement>('.js-cfg-variant', page)
      const variantList = page.querySelector<HTMLElement>('.js-cfg-variant-list')
      const pagination = page.querySelector<HTMLElement>('.js-cfg-pagination')

      if (title) {
        gsap.set(title, {
          autoAlpha: 0,
          x: -36,
          clipPath: 'inset(0% 100% 0% 0%)',
        })
      }

      gsap.set(compact([breadcrumb]), {autoAlpha: 0, x: 24})
      gsap.set(compact([sidebar]), {autoAlpha: 0, x: -28})

      const intro = gsap.timeline({defaults: {ease: 'power3.out'}})

      intro
        .to(
          title,
          {
            autoAlpha: 1,
            x: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.82,
            ease: 'expo.out',
          },
          0,
        )
        .to(compact([breadcrumb]), {autoAlpha: 1, x: 0, duration: 0.58}, 0.16)
        .to(compact([sidebar]), {autoAlpha: 1, x: 0, duration: 0.7}, 0.28)

      if (preview && previewImage) {
        gsap.set(preview, {
          autoAlpha: 0,
          clipPath: 'inset(100% 0% 0% 0% round 8px)',
          y: -20,
        })
        gsap.set(previewImage, {scale: 1.08, transformOrigin: '50% 50%'})

        intro
          .to(
            preview,
            {
              autoAlpha: 1,
              clipPath: 'inset(0% 0% 0% 0% round 8px)',
              y: 0,
              duration: 0.86,
              ease: 'power4.out',
            },
            0.1,
          )
          .to(previewImage, {scale: 1, duration: 1.05, ease: 'power2.out'}, 0.22)
      }

      if (thumbs.length > 0) {
        gsap.set(thumbs, {autoAlpha: 0, y: 14, scale: 0.9})
        intro.to(
          thumbs,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.48,
            stagger: 0.06,
            ease: 'back.out(1.35)',
          },
          0.45,
        )
      }

      if (collectionModels.length > 0) {
        gsap.set(collectionModels, {autoAlpha: 0, scale: 0.88})
        intro.to(
          collectionModels,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(1.5)',
          },
          0.38,
        )
      }

      if (filterSections.length > 0) {
        gsap.set(filterSections, {autoAlpha: 0, y: 18})
        intro.to(
          filterSections,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.52,
            stagger: 0.06,
            ease: 'power2.out',
          },
          0.42,
        )
      }

      if (variants.length > 0 && variantList) {
        gsap.set(variants, {
          autoAlpha: 0,
          x: 28,
          clipPath: 'inset(0% 0% 100% 0%)',
        })

        gsap.to(variants, {
          scrollTrigger: {
            trigger: variantList,
            start: 'top 88%',
            once: true,
          },
          autoAlpha: 1,
          x: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          clearProps: 'clipPath,transform',
          duration: 0.62,
          stagger: 0.07,
          ease: 'power3.out',
        })
      }

      if (pagination) {
        gsap.set(pagination, {autoAlpha: 0, y: 16})
        gsap.to(pagination, {
          scrollTrigger: {
            trigger: pagination,
            start: 'top 94%',
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        })
      }
    }, page)

    return () => ctx.revert()
  }, [])

  return null
}
