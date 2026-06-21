'use client'

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {FiHeart, FiPlus} from 'react-icons/fi'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import ProductHotspotButton from '@/components/products/ProductHotspotButton'

gsap.registerPlugin(ScrollTrigger)

export type SpotlightItem = {
  key: string
  index: number
  imageUrl: string | null
  imageAlt: string
  hotspotX: number
  hotspotY: number
  name: string
  slug: string
  badgeText: string | null
  description: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const headingClassName =
  'relative z-[8] m-0 text-center font-[500] md:font-[600] text-[20px] leading-tight tracking-normal text-[#121827] md:text-5xl md:leading-none lg:text-[48px]'

function ProductSplitTitle({title}: {title: string}) {
  const segments = title.split(/(\s+)/)
  return (
    <h2 className={headingClassName} aria-label={title}>
      {segments.map((seg, i) =>
        /^\s+$/.test(seg) ? (
          seg
        ) : (
          <span key={i} className="product-word-outer inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
            <span className="product-word-inner inline-block will-change-transform">{seg}</span>
          </span>
        ),
      )}
    </h2>
  )
}

// At md+ products are absolutely positioned — stage must be `block` not `grid`
const stageClassName =
  'relative grid w-full grid-cols-1 gap-10 px-5 pb-10 pt-24 md:block md:min-h-[560px] md:px-0 md:pb-0 md:pt-0 lg:min-h-[clamp(520px,48vw,740px)]'

const itemBaseClassName =
  'product-item relative flex min-w-0 flex-col items-center justify-start gap-12 md:absolute md:min-h-0 md:justify-center md:gap-0'

const productImageClassName =
  'h-[360px] w-full object-contain drop-shadow-[0_20px_28px_rgba(16,24,40,0.1)] md:h-[clamp(280px,34vw,540px)]'

const productPlaceholderClassName =
  'grid min-h-60 w-[min(82%,420px)] place-items-center rounded-[18px] border border-dashed border-[#d8dde6] bg-white p-7 text-center text-[#626a78] shadow-[0_20px_46px_rgba(16,24,40,0.06)]'

const hotspotWrapClassName = 'absolute z-[7] hidden h-0 w-0 md:block'

const popoverBaseClassName =
  'product-popover absolute left-1/2 top-10 z-20 w-[min(420px,calc(100vw-42px))] -translate-x-1/2 rounded-xl bg-white p-5 shadow-[0_8px_32px_rgba(16,24,40,0.08),0_28px_72px_rgba(16,24,40,0.13)] md:left-12 md:top-[-170px] md:w-[clamp(300px,28vw,420px)] md:translate-x-0 lg:w-[clamp(320px,24vw,460px)] lg:p-7'

const productMetaClassName =
  'mb-2 mt-0 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--color-brand-orange)]'

const productPopoverTitleClassName =
  'mb-4 mt-0 font-[var(--font-display)] text-xl leading-tight tracking-normal text-[#121827] md:text-2xl'

const productPopoverTextClassName = 'm-0 text-base leading-6 text-[#3f4656]'

const productActionsClassName =
  'mt-5 grid grid-cols-[minmax(0,1fr)_50px_50px] gap-2.5 md:grid-cols-[minmax(0,1fr)_58px_58px]'

const iconActionClassName =
  'grid min-h-[50px] place-items-center rounded-lg bg-white text-2xl text-[var(--color-brand-orange)] shadow-[inset_0_0_0_1px_rgba(232,235,240,0.95)] transition hover:-translate-y-px hover:text-[var(--color-brand-orange-hover)] hover:shadow-[inset_0_0_0_1px_rgba(255,95,46,0.28),0_10px_24px_rgba(16,24,40,0.08)] focus-visible:-translate-y-px focus-visible:text-[var(--color-brand-orange-hover)]'

const mobileCardClassName =
  'grid w-full gap-5 rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(16,24,40,0.08)] md:hidden'

const mobileTitleClassName = 'm-0 text-[26px] font-[600] leading-tight text-[#121827]'

const mobileDescriptionClassName = 'm-0 text-[20px] leading-7 text-[#3f4656]'

const mobileActionsClassName = 'grid grid-cols-[minmax(0,1fr)_56px_56px] gap-2.5'

export default function ProductSpotlightClient({
  items,
  title,
}: {
  items: SpotlightItem[]
  title: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(1)
  const titleWrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mobileFeaturedIndex = items[1]?.index ?? items[0]?.index

  // Title word-split reveal — same feel as hero / gallery
  useEffect(() => {
    const wrap = titleWrapRef.current
    if (!wrap) return
    const words = wrap.querySelectorAll('.product-word-inner')
    if (words.length === 0) return
    gsap.set(words, {yPercent: 115})
    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          yPercent: 0,
          duration: 1.1,
          stagger: {amount: 0.5, ease: 'power2.inOut'},
          ease: 'power4.out',
        })
      },
    })
    return () => trigger.kill()
  }, [])

  // Close popup when clicking outside hotspot buttons and popovers
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element
      if (target.closest('.product-hotspot-btn')) return
      if (target.closest('.product-popover')) return
      setOpenIndex(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Scroll-scrub animation with responsive matchMedia
  useEffect(() => {
    if (!stageRef.current) return
    const stage = stageRef.current
    const mm = gsap.matchMedia()

    // Desktop: three-direction slide; centering via xPercent/yPercent
    // (CSS translate classes would conflict with GSAP scrub so we use GSAP percent props)
    mm.add('(min-width: 768px)', () => {
      stage.querySelectorAll<HTMLElement>('.product-item').forEach((el, i) => {
        gsap.fromTo(
          el,
          {
            x: i === 0 ? -90 : i === 2 ? 90 : 0,
            y: i === 1 ? 72 : 0,
            xPercent: i === 1 ? -50 : 0,
            yPercent: -50,
            opacity: 0,
            scale: i === 1 ? 0.91 : 0.93,
          },
          {
            x: 0,
            y: 0,
            xPercent: i === 1 ? -50 : 0,
            yPercent: -50,
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stage,
              start: 'top 70%',
              end: 'top 18%',
              scrub: 1.4,
            },
          }, 
        )
      })
    })

    // Mobile: simple fade-up scrub per product
    mm.add('(max-width: 767px)', () => {
      stage.querySelectorAll<HTMLElement>('.product-item').forEach((el) => {
        gsap.fromTo(
          el,
          {y: 36, opacity: 0},
          {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'top 64%',
              scrub: 0.8,
            },
          },
        )
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <>
      <div ref={titleWrapRef}>
        <ProductSplitTitle title={title} />
      </div>
      <div ref={stageRef} className={stageClassName}>
        {items.map((item) => {
          const isOpen = openIndex === item.index
          const isMobileFeatured = item.index === mobileFeaturedIndex
          return (
            <article
              className={cx(
                itemBaseClassName,
                !isMobileFeatured && 'hidden md:flex',
                item.index === 0 && 'md:left-[-5%] md:top-[55%] md:z-[2] md:w-[clamp(280px,29vw,480px)]',
                item.index === 1 && 'md:left-[50%] md:top-[47%] md:z-[4] md:w-[clamp(260px,25vw,420px)]',
                item.index === 2 && 'md:right-[-1%] md:top-[55%] md:z-[3] md:w-[clamp(280px,29vw,480px)]',
              )}
              key={item.key}
            >
              {item.imageUrl ? (
                <img className={productImageClassName} src={item.imageUrl} alt={item.imageAlt} />
              ) : (
                <div className={productPlaceholderClassName}>
                  <span className="max-w-64 text-lg font-extrabold">{item.name}</span>
                </div>
              )}

              {isMobileFeatured ? (
                <div className={mobileCardClassName}>
                  {item.badgeText ? (
                    <p className={productMetaClassName}>{item.badgeText}</p>
                  ) : null}
                  <h3 className={mobileTitleClassName}>{item.name}</h3>
                  <p className={mobileDescriptionClassName}>{item.description}</p>
                  <div className={mobileActionsClassName}>
                    <Link
                      className="btn btn-primary !min-h-14 !rounded-lg !text-[18px] !font-extrabold"
                      href={`/configurator/product/${item.slug}`}
                    >
                      Configure
                    </Link>
                    <Link
                      className={cx(iconActionClassName, '!min-h-14 !rounded-lg')}
                      href={`/products/${item.slug}`}
                      aria-label={`View ${item.name}`}
                    >
                      <FiHeart aria-hidden />
                    </Link>
                    <Link
                      className={cx(iconActionClassName, '!min-h-14 !rounded-lg')}
                      href={`/products/${item.slug}`}
                      aria-label={`Open ${item.name}`}
                    >
                      <FiPlus aria-hidden />
                    </Link>
                  </div>
                </div>
              ) : null}

              <div
                className={hotspotWrapClassName}
                style={{left: `${item.hotspotX}%`, top: `${item.hotspotY}%`}}
              >
                <ProductHotspotButton
                  isOpen={isOpen}
                  onClick={() => setOpenIndex((prev) => (prev === item.index ? null : item.index))}
                  label={`${isOpen ? 'Close' : 'Open'} ${item.name} details`}
                />

                {/* Popover — always mounted for smooth exit transition */}
                <div
                  className={cx(
                    popoverBaseClassName,
                    item.index === 0 && 'md:top-[-140px] md:left-14',
                    item.index === 2 && 'md:left-auto md:right-14',
                    'transition-[opacity,transform] duration-[260ms]',
                    isOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100 scale-100'
                      : 'pointer-events-none translate-y-3 opacity-0 scale-[0.96]',
                  )}
                >
                  {item.badgeText ? (
                    <p className={productMetaClassName}>{item.badgeText}</p>
                  ) : null}
                  <h3 className={productPopoverTitleClassName}>{item.name}</h3>
                  <p className={productPopoverTextClassName}>{item.description}</p>
                  <div className={productActionsClassName}>
                    <Link
                      className="btn btn-primary !min-h-[50px] rounded-[10px] md:!rounded-[8px] !font-semibold"
                      href={`/configurator/product/${item.slug}`}
                    >
                      Configure
                    </Link>
                    <Link
                      className={iconActionClassName}
                      href={`/products/${item.slug}`}
                      aria-label={`View ${item.name}`}
                    >
                      <FiHeart aria-hidden />
                    </Link>
                    <Link
                      className={iconActionClassName}
                      href={`/products/${item.slug}`}
                      aria-label={`Open ${item.name}`}
                    >
                      <FiPlus aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
