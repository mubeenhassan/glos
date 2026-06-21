'use client'

import {useEffect, useRef, useState} from 'react'
import type {ResourceAsset} from '@/lib/catalog'

type VariantAssetMenuProps = {
  downloads?: ResourceAsset[]
  sku: string
  triggerClassName?: string
}

function getDownloadUrl(fileUrl: string, title: string) {
  const url = new URL(fileUrl, window.location.href)

  if (url.hostname.endsWith('cdn.sanity.io')) {
    const extension = url.pathname.match(/\.[a-z0-9]+$/i)?.[0] || ''
    const filename = `${title.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'asset'}${extension}`
    url.searchParams.set('dl', filename)
  }

  return url.toString()
}

export default function VariantAssetMenu({
  downloads,
  sku,
  triggerClassName = 'size-5',
}: VariantAssetMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const availableDownloads = (downloads || []).filter(
    (asset) => asset.fileUrl || asset.externalUrl,
  )
  const hasDownloads = availableDownloads.length > 0

  useEffect(() => {
    if (!isOpen) return

    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  function downloadAssets() {
    availableDownloads.forEach((asset, index) => {
      const fileUrl = asset.fileUrl || asset.externalUrl
      if (!fileUrl) return

      window.setTimeout(() => {
        const link = document.createElement('a')
        link.href = getDownloadUrl(fileUrl, asset.title || sku)
        link.download = ''
        link.target = '_blank'
        link.rel = 'noreferrer noopener'
        document.body.appendChild(link)
        link.click()
        link.remove()
      }, index * 150)
    })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={`inline-flex cursor-pointer ${triggerClassName} items-center justify-center text-xl leading-none text-[#6b7280] hover:text-[#111827]`}
        aria-label={`Open actions for ${sku}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-30 mt-1 min-w-[170px] rounded-md border border-[#E5E7EB] bg-white p-1 shadow-lg"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!hasDownloads}
            title={hasDownloads ? 'Download assets' : 'No assets available'}
            onClick={downloadAssets}
            className="flex w-full items-center rounded px-3 py-2 text-left text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:text-[#9CA3AF] disabled:hover:bg-transparent cursor-pointer"
          >
            {hasDownloads ? 'Download assets' : 'No assets available'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
