'use client'

import {useEffect, useRef} from 'react'
import Link from 'next/link'
import {FiArrowRight, FiDownload, FiHeart, FiPlus} from 'react-icons/fi'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

type ShowcaseLink = {
  text: string
  href: string
  isExternal?: boolean
  openInNewTab?: boolean
}

type ShowcaseDownload = {
  key: string
  label: string
  url: string
}

type ShowcaseSpec = {
  key: string
  label: string
  color?: string
}

type PinnedProductShowcaseProps = {
  title: string
  detailTitle: string
  description: string
  backgroundImageUrl: string
  backgroundAlt: string
  productImageUrl: string | null
  productImageAlt: string
  productHref: string
  configureHref: string
  cta?: ShowcaseLink
  specs: ShowcaseSpec[]
  downloads: ShowcaseDownload[]
  productSlug: string
}

gsap.registerPlugin(ScrollTrigger)

const configureBtnCls =
  'js-action-item group relative inline-flex h-[48px] md:h-[60px] flex-1 items-center justify-between gap-3 rounded-[2px] bg-[var(--color-brand-orange)] px-5 text-[1rem] font-medium md:font-semibold tracking-[1.6] !text-[#FFFFFF] shadow-[0_10px_30px_rgba(255,95,46,0.36),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_16px_38px_rgba(255,95,46,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] focus-visible:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40'

function ConfigureButton({link, fallbackHref}: {link: ShowcaseLink | undefined; fallbackHref: string}) {
  const text = link?.text || 'Configure now'
  const href = link?.href || fallbackHref

  const inner = (
    <>
      <span className="leading-none">{text}</span>
      <FiArrowRight aria-hidden className="text-lg transition-transform duration-200 group-hover:translate-x-1" />
    </>
  )

  if (link?.isExternal) {
    return (
      <a
        className={configureBtnCls}
        href={href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noreferrer noopener' : undefined}
      >
        {inner}
      </a>
    )
  }
  return (
    <Link className={configureBtnCls} href={href}>
      {inner}
    </Link>
  )
}

export default function PinnedProductShowcase({
  title,
  detailTitle,
  description,
  backgroundImageUrl,
  backgroundAlt,
  productImageUrl,
  productImageAlt,
  productHref,
  configureHref,
  cta,
  specs,
  downloads,
  productSlug
}: PinnedProductShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const railFillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const scene = sceneRef.current
    const fill = railFillRef.current
    if (!section || !scene) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      const productCard = section.querySelector<HTMLElement>('.js-product-card')
      const variantCard = section.querySelector<HTMLElement>('.js-variant-card')
      const specCard = section.querySelector<HTMLElement>('.js-spec-card')
      const downloadCard = section.querySelector<HTMLElement>('.js-download-card')
      const actionItems = Array.from(section.querySelectorAll<HTMLElement>('.js-action-item'))

      if (productCard) gsap.set(productCard, {opacity: 0, y: 48, scale: 0.95})
      if (variantCard) gsap.set(variantCard, {opacity: 0, y: -28})
      if (specCard) gsap.set(specCard, {opacity: 0, x: -34})
      if (downloadCard) gsap.set(downloadCard, {opacity: 0, x: 34})
      if (actionItems.length > 0) gsap.set(actionItems, {opacity: 0, y: 28})
      if (fill) gsap.set(fill, {scaleY: 0})

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 2.7, 1800)}`,
          pin: scene,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      if (fill) {
        tl.to(fill, {scaleY: 1, ease: 'none', duration: 1}, 0)
      }
      if (productCard) {
        tl.to(productCard, {opacity: 1, y: 0, scale: 1, ease: 'power2.out', duration: 0.42}, 0)
      }
      if (variantCard) {
        tl.to(variantCard, {opacity: 1, y: 0, ease: 'power2.out', duration: 0.34}, 0.12)
      }
      if (specCard) {
        tl.to(specCard, {opacity: 1, x: 0, ease: 'power2.out', duration: 0.36}, 0.24)
      }
      if (downloadCard) {
        tl.to(downloadCard, {opacity: 1, x: 0, ease: 'power2.out', duration: 0.36}, 0.36)
      }
      if (actionItems.length > 0) {
        tl.to(actionItems, {opacity: 1, y: 0, ease: 'power2.out', duration: 0.32, stagger: 0.05}, 0.48)
      }

      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
      return () => window.cancelAnimationFrame(refreshFrame)
    })

    return () => mm.revert()
  }, [])

  const iconBtnCls =
    'js-action-item grid h-[48px] w-[48px] md:h-[60px] md:w-[60px] flex-shrink-0 place-items-center rounded-[2px] border border-white/70 bg-white text-xl text-[var(--color-brand-orange)] shadow-[0_10px_28px_rgba(16,24,40,0.18),0_2px_6px_rgba(16,24,40,0.06)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[rgba(255,95,46,0.32)] hover:shadow-[0_16px_36px_rgba(16,24,40,0.22),0_2px_6px_rgba(16,24,40,0.08)] focus-visible:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(255,95,46,0.5)]'

  return (
    <section ref={sectionRef} className="relative hidden bg-[#0b0c0e] md:block">
      <div ref={sceneRef} className="relative overflow-hidden px-5  py-16 md:h-screen md:min-h-[760px] md:overflow-visible md:p-0">

        {/* Background */}
        <div className="absolute inset-0" aria-hidden>
          <img className="h-full w-full object-cover" src={backgroundImageUrl} alt={backgroundAlt} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.7)_44%,rgba(0,0,0,0.46)_100%),linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.56)_100%)]" />
          {/* subtle vignette for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />
        </div>

        {/* Progress rail */}
        <div className="absolute inset-y-0 left-0 z-20 hidden w-[3px] md:block" aria-hidden>
          <div className="h-full w-full bg-white/[0.1]" />
          <div
            ref={railFillRef}
            className="absolute inset-x-0 top-0 w-full origin-top bg-gradient-to-b from-[var(--color-brand-orange)]/80 via-[var(--color-brand-orange)]/80 to-[#ff8a4f]/80"
            style={{height: '100%', boxShadow: '0 0 24px rgba(255,95,46,0.55)'}}
          />
        </div>

        {/* Inner max-width container */}
        <div className="cms-section-width relative z-[5] h-full">

          {/* Left column: pinned title */}
          <div className="relative z-[6] mb-8 md:absolute md:left-0 md:top-1/2 md:mb-0 md:w-[clamp(200px,28vw,460px)] md:-translate-y-1/2">
            <h2 className="m-0 bg-gradient-to-br from-white via-white to-white/70 bg-clip-text font-[var(--font-display)] text-4xl font-semibold leading-tight text-transparent md:text-5xl lg:text-[clamp(2.8rem,4.4vw,5.4rem)] lg:leading-[1.02] lg:tracking-[-0.01em]">
              {title}
            </h2>
            {description ? (
              <p className="mt-5 hidden text-base leading-relaxed text-white/55 md:block md:text-[clamp(0.92rem,1.05vw,1.04rem)]">
                {description}
              </p>
            ) : null}
          </div>

          {/* Right product stage */}
          <div className="relative z-[6] md:absolute md:left-[42%] md:right-0 md:top-0 md:bottom-0 md:flex md:items-center md:justify-center">

            {/* Cluster: relative parent for floating cards. Width = product card width. */}
            <div className="relative md:w-[clamp(280px,24vw,360px)]">

              {/* ── Variant thumbnails — top-right, slightly above the card ── */}
              {specs.length > 0 ? (
                <div className="mb-4 md:absolute z-90 md:bottom-[calc(100%-10%)] md:right-[-40px] md:mb-0">
                  <div className="js-variant-card flex gap-3">
                    {specs.slice(0, 2).map((spec) => (
                      <div
                        key={spec.key}
                        className="flex flex-col overflow-hidden rounded-[2px] border border-white/40 bg-white shadow-[0_14px_36px_rgba(0,0,0,0.24),0_2px_6px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_18px_44px_rgba(0,0,0,0.3),0_2px_6px_rgba(0,0,0,0.1)]"
                        style={{minWidth: 'clamp(96px,8.4vw,128px)'}}
                      >
                        <div
                          className="flex h-[78px] items-center justify-center"
                          style={{
                            background: spec.color
                              ? `linear-gradient(135deg, ${spec.color}24, ${spec.color}10)`
                              : 'linear-gradient(135deg, #f4f5f7, #e9ecef)',
                          }}
                        >
                          <div
                            className="h-6 w-12 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
                            style={{backgroundColor: spec.color || '#f2b44c'}}
                          />
                        </div>
                        <div className="border-t border-[#f0f2f5] px-2.5 py-2.5">
                          <p className="m-0 text-center text-[10.5px] font-bold leading-snug tracking-tight text-[#1a2030]">{spec.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── Main product card — image + name only ── */}
              <Link href={`/products/${productSlug}`} className="js-product-card w-full block overflow-hidden hover:border-[var(--color-brand-orange)] border-[2px] transition duration-500 rounded-[3px] border border-white/40 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.34),0_4px_14px_rgba(0,0,0,0.1)]">

                {/* Image area */}
                <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f8fa] via-[#eef0f3] to-[#e6e9ed] p-6 md:p-9">
                  {/* subtle radial highlight */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_28%,rgba(255,255,255,0.7)_0%,transparent_70%)]" aria-hidden />
                  {productImageUrl ? (
                    <img
                      className="relative z-[1] h-[180px] w-full object-contain drop-shadow-[0_22px_36px_rgba(14,18,28,0.22)] md:h-[clamp(170px,18vw,300px)]"
                      src={productImageUrl}
                      alt={productImageAlt}
                    />
                  ) : (
                    <div className="grid min-h-[180px] w-full place-items-center text-[#566070] md:min-h-[clamp(170px,18vw,270px)]">
                      <span className="text-sm font-semibold">{detailTitle}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* ── Spec chips — UPPER LEFT around image area on xl+ ── */}
              {specs.length > 0 ? (
                <div className="mt-3 xl:absolute xl:right-[85%] xl:top-[26%] min-w-[250px] xl:-translate-y-1/2 xl:pr-5 xl:mt-0">
                  <div className="js-spec-card flex flex-col gap-2.5">
                    {specs.map((spec) => (
                      <div
                        key={spec.key}
                        className="flex items-center gap-3 rounded-[1px] border border-white/40 bg-white/96 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.08)]"
                        style={{minWidth: '142px'}}
                      >
                        <span
                          className="h-3.5 w-3.5 flex-shrink-0 rounded-[5px] shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
                          style={{backgroundColor: spec.color || '#f2b44c'}}
                        />
                        <span className="text-[12px] font-bold tracking-tight text-[#1a2030]">{spec.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── Download card — MIDDLE RIGHT around image area on xl+ ── */}
              {downloads.length > 0 ? (
                <div className="mt-3 xl:absolute xl:left-[90%] xl:top-[71%] xl:-translate-y-1/2 xl:pl-5 xl:mt-0">
                  <div className="js-download-card overflow-hidden rounded-[2px] border border-white/40 bg-white shadow-[0_18px_56px_rgba(0,0,0,0.24),0_2px_8px_rgba(0,0,0,0.08)] xl:w-[clamp(220px,16.5vw,300px)]">
                    {downloads.map((dl, i) => (
                      <a
                        key={dl.key}
                        className="group flex min-h-[48px] items-center gap-3 px-5 py-3 text-[#1b67ff] transition-colors duration-150 hover:bg-[#f3f6ff] [&_svg]:h-[16px] [&_svg]:w-[16px] [&_svg]:flex-shrink-0"
                        href={dl.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{borderTop: i > 0 ? '1px solid #f0f2f5' : undefined}}
                      >
                        <FiDownload aria-hidden className="transition-transform duration-200 group-hover:-translate-y-[2px] group-hover:translate-x-[1px]" />
                        <span className="text-[13px] font-semibold leading-snug">{dl.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── Action row — BELOW the card, separate floating buttons ── */}
              <div className="mt-4 md:absolute md:left-0 md:right-0 md:top-[calc(100%+18px)] md:mt-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-2.5 items-center">

                  <Link className={iconBtnCls} href={productHref} aria-label={`Add ${detailTitle}`}>
                    <FiPlus aria-hidden />
                  </Link>
                  <Link className={iconBtnCls} href={productHref} aria-label={`Save ${detailTitle}`}>
                    <FiHeart aria-hidden />
                  </Link>
                  </div>
                  <ConfigureButton link={cta} fallbackHref={configureHref} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
