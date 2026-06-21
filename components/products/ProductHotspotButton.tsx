'use client'

import type {CSSProperties, MouseEventHandler} from 'react'

type ProductHotspotButtonProps = {
  isOpen: boolean
  label: string
  onClick: MouseEventHandler<HTMLButtonElement>
  controlsId?: string
  style?: CSSProperties
}

const baseClassName =
  'product-hotspot-btn absolute z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-[7px] bg-[var(--color-brand-orange)] shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[rgba(255,95,46,0.34)] md:border-8'

export default function ProductHotspotButton({
  isOpen,
  label,
  onClick,
  controlsId,
  style,
}: ProductHotspotButtonProps) {
  return (
    <button
      type="button"
      className={`${baseClassName} ${
        isOpen
          ? 'border-[var(--color-brand-orange)] shadow-[0_0_0_5px_rgba(255,95,46,0.16),0_12px_26px_rgba(0,0,0,0.18)]'
          : 'border-[#080707]'
      }`}
      style={style}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={label}
    >
      <span
        className={`h-4 w-4 rounded-full transition-colors duration-200 ${
          isOpen ? 'bg-[#080707]' : 'bg-transparent'
        }`}
      />
    </button>
  )
}
