'use client'

import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

export type ProductsFilterDropdownOption = {
  label: string
  href: string
  active: boolean
}

type ProductsFilterDropdownProps = {
  displayLabel: string
  options: ProductsFilterDropdownOption[]
}

export default function ProductsFilterDropdown({
  displayLabel,
  options,
}: ProductsFilterDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isOpen) return
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className="products-filter-dropdown">
      <button
        type="button"
        className="products-filter-dropdown-trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={displayLabel === 'Any' ? 'text-[#9ca3af]' : ''}>
          {displayLabel}
        </span>
        <svg
          className={`products-filter-dropdown-chevron ${isOpen ? 'is-open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="products-filter-dropdown-menu" role="listbox">
          {options.map((option) => (
            <Link
              key={`${option.href}-${option.label}`}
              href={option.href}
              role="option"
              aria-selected={option.active}
              className={`products-filter-dropdown-item ${option.active ? 'is-active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {option.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
