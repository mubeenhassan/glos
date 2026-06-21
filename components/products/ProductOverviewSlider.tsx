'use client'

import Link from 'next/link'
import Image from 'next/image'
import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react'
import {FiArrowLeft, FiArrowRight, FiX} from 'react-icons/fi'
import ProductHotspotButton from './ProductHotspotButton'

export type OverviewHotspotView = {
  key: string
  x: number
  y: number
  product: {
    name: string
    slug: string
    description?: string
    badge?: string
  }
}

export type OverviewSlideView = {
  key: string
  imageUrl: string | null
  alt: string
  aspectRatio: number
  hotspots: OverviewHotspotView[]
}

type OpenHotspot = OverviewHotspotView & {trigger: HTMLButtonElement}
type PopupPosition = {left: number; top: number}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function positionPopup(open: OpenHotspot): PopupPosition {
  const rect = open.trigger.getBoundingClientRect()
  const mobile = window.innerWidth < 768
  if (mobile) return {left: 12, top: Math.max(12, window.innerHeight - 292)}

  const width = 360
  const height = 250
  const gap = 18
  let left = rect.right + gap
  let top = rect.top + rect.height / 2 - height / 2

  if (left + width > window.innerWidth - 16) {
    left = rect.left - width - gap
  }

  return {
    left: clamp(left, 16, window.innerWidth - width - 16),
    top: clamp(top, 16, window.innerHeight - height - 16),
  }
}

export default function ProductOverviewSlider({slides}: {slides: OverviewSlideView[]}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [open, setOpen] = useState<OpenHotspot | null>(null)
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({left: 12, top: 12})

  const updateSliderState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    setCanGoBack(viewport.scrollLeft > 2)
    setCanGoForward(viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 2)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(updateSliderState)
    observer.observe(viewport)
    const frame = requestAnimationFrame(updateSliderState)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [slides.length, updateSliderState])

  useEffect(() => {
    if (!open) return
    const update = () => setPopupPosition(positionPopup(open))
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(null)
        open.trigger.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (popupRef.current?.contains(target) || open.trigger.contains(target)) return
      setOpen(null)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current
    const slideElements = viewport?.querySelectorAll<HTMLElement>('[data-overview-slide]')
    if (!viewport || !slideElements?.length) return
    const slidesArray = Array.from(slideElements)
    const currentIndex = slidesArray.reduce(
      (closestIndex, slide, index) =>
        Math.abs(slide.offsetLeft - viewport.scrollLeft) <
        Math.abs(slidesArray[closestIndex].offsetLeft - viewport.scrollLeft)
          ? index
          : closestIndex,
      0,
    )
    const targetIndex = clamp(currentIndex + direction, 0, slidesArray.length - 1)
    viewport.scrollTo({left: slidesArray[targetIndex].offsetLeft, behavior: 'smooth'})
  }

  if (!slides.length) return null

  return (
    <section aria-label="Product overview gallery" className="relative mt-10 md:mt-12">
      <div
        ref={viewportRef}
        onScroll={updateSliderState}
        className="flex items-start snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth rounded-[8px] [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <article
            key={slide.key}
            data-overview-slide
            className="product-overview-slide relative shrink-0 snap-start overflow-hidden rounded-[8px] bg-[#eceef2]"
            style={
              {
                '--overview-slide-aspect': slide.aspectRatio,
                '--overview-slide-mobile-width': `${Math.min(slide.aspectRatio * 420, 720)}px`,
                '--overview-slide-desktop-width': `${Math.min(slide.aspectRatio * 560, 960)}px`,
              } as CSSProperties
            }
          >
            {slide.imageUrl ? (
              <Image
                src={slide.imageUrl}
                alt={slide.alt}
                fill
                sizes="(min-width: 1024px) 75vw, (min-width: 768px) 80vw, 100vw"
                className="object-cover"
              />
            ) : null}
            {slide.hotspots.map((hotspot) => {
              const expanded = open?.key === hotspot.key
              return (
                <ProductHotspotButton
                  key={hotspot.key}
                  style={{left: `${clamp(hotspot.x, 0, 100)}%`, top: `${clamp(hotspot.y, 0, 100)}%`}}
                  isOpen={expanded}
                  controlsId="product-overview-popover"
                  label={`${expanded ? 'Close' : 'Open'} details for ${hotspot.product.name}`}
                  onClick={(event) => {
                    if (expanded) setOpen(null)
                    else setOpen({...hotspot, trigger: event.currentTarget})
                  }}
                />
              )
            })}
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous overview image"
            disabled={!canGoBack}
            onClick={() => move(-1)}
            className="absolute left-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/75 text-xl text-white shadow-lg transition disabled:pointer-events-none disabled:opacity-0 md:left-4 md:h-14 md:w-14"
          >
            <FiArrowLeft aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next overview image"
            disabled={!canGoForward}
            onClick={() => move(1)}
            className="absolute right-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/75 text-xl text-white shadow-lg transition disabled:pointer-events-none disabled:opacity-0 md:right-4 md:h-14 md:w-14"
          >
            <FiArrowRight aria-hidden />
          </button>
        </>
      ) : null}

      {open ? (
        <div
          id="product-overview-popover"
          ref={popupRef}
          role="region"
          aria-label={`${open.product.name} details`}
          className="fixed z-[80] w-[calc(100vw-24px)] rounded-[12px] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,.25)] md:w-[360px] md:p-6"
          style={{left: popupPosition.left, top: popupPosition.top}}
        >
          <button
            type="button"
            aria-label="Close product details"
            onClick={() => {
              setOpen(null)
              open.trigger.focus()
            }}
            className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full text-xl text-[#111827] hover:bg-[#f2f3f5]"
          >
            <FiX aria-hidden />
          </button>
          {open.product.badge ? (
            <p className="m-0 pr-10 text-[12px] font-[700] uppercase tracking-[0.08em] text-[#fb612e]">{open.product.badge}</p>
          ) : null}
          <h3 className="m-0 mt-2 pr-10 text-[24px] font-[600] leading-tight text-[#111827]">{open.product.name}</h3>
          {open.product.description ? (
            <p className="m-0 mt-3 line-clamp-3 text-[15px] leading-6 text-[#525866]">{open.product.description}</p>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link href={`/products/${open.product.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#e1e4e8] px-3 text-[14px] font-[600] text-[#111827]">
              View product
            </Link>
            <Link href={`/configurator/product/${open.product.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#fb612e] px-3 text-[14px] font-[600] !text-white">
              Configure
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
