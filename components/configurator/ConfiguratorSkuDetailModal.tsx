'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import ConfiguratorSkuDetailBody from '@/components/configurator/ConfiguratorSkuDetailBody'
import type {SkuDetailPayload} from '@/lib/configuratorSkuDetail'

type ConfiguratorSkuDetailModalProps = {
  isOpen: boolean
  closeHref: string
  detail: SkuDetailPayload | null
}

export default function ConfiguratorSkuDetailModal({
  isOpen,
  closeHref,
  detail,
}: ConfiguratorSkuDetailModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.push(closeHref, {scroll: false})
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeHref, isOpen, router])

  if (!mounted || !isOpen || !detail) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1000002] flex items-end justify-center bg-[rgba(17,24,39,0.48)] p-2 backdrop-blur-[2px] md:items-center md:p-4 md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          router.push(closeHref, {scroll: false})
        }
      }}
    >
      <div
        className="md:max-h-[92dvh] max-h-[calc(100dvh-15px)] w-full max-w-[980px] overflow-auto bg-white px-4 py-[18px] pb-5 shadow-[0_24px_48px_rgba(17,24,39,0.18),0_8px_16px_rgba(17,24,39,0.08)] md:rounded-xl md:px-6 md:pt-[22px] md:pb-[26px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cfg-sku-modal-title"
      >
        <div className="mb-[22px] grid gap-2.5">
          <Link
            className="whitespace-nowrap text-[14px] !text-[#2563EB] "
            href={closeHref}
            scroll={false}
            onClick={(event) => {
              event.preventDefault()
              router.push(closeHref, {scroll: false})
            }}
          >
            <span className="mr-1 !text-[#2563EB] "  aria-hidden="true">
              ‹
            </span>
            View all SKUs
          </Link>
          <h2
            id="cfg-sku-modal-title"
            className="m-0 text-[14px] font-[700] leading-tight tracking-[-0.02em] text-[#111827]"
          >
            {detail.sku}
          </h2>
        </div>

        <ConfiguratorSkuDetailBody detail={detail} />
      </div>
    </div>,
    document.body,
  )
}
