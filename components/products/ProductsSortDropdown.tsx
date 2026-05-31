'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'

type SortOption = {
  key: string
  label: string
}

type ProductsSortDropdownProps = {
  options: readonly SortOption[]
  activeSort: string
  basePath?: string
  queryString?: string
}

export default function ProductsSortDropdown({
  options,
  activeSort,
  basePath = '/products',
  queryString = '',
}: ProductsSortDropdownProps) {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isOpen) return
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) {
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

  function onSelect(nextSort: string) {
    const params = new URLSearchParams(queryString)
    params.set('sort', nextSort)
    params.set('page', '1')
    router.push(`${basePath}?${params.toString()}`, {scroll: false})
    setIsOpen(false)
  }

  const selectedLabel =
    options.find((option) => option.key === activeSort)?.label || 'Featured'

  return (
    <div ref={rootRef} className="flex items-center gap-2 w-full md:w-auto">
      <span className="shrink-0 text-[14px] md:text-[20px] text-[#374151]">
        Sort by:
      </span>

      <div className="relative w-full md:w-auto" >
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="min-w-[140px] w-full md:w-auto rounded-[8px] border border-[#0000001A] bg-white px-4 md:py-2.5 py-1.5 text-left text-[14px] font-medium text-[#374151] transition-colors hover:border-[#d1d5db] focus:border-[#d1d5db] focus:outline-none"
        >
          {selectedLabel}
        </button>

        {isOpen ? (
          <div
            className="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-[8px] border border-[#0000001A] bg-white py-1 shadow-[0_4px_16px_rgba(15,23,42,0.08)]"
            role="listbox"
            aria-label="Sort products"
          >
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                role="option"
                aria-selected={activeSort === option.key}
                onClick={() => onSelect(option.key)}
                className={`block w-full px-4 py-2.5 text-left text-[16px] font-medium transition-colors ${
                  activeSort === option.key
                    ? 'bg-[#f9fafb] text-[#111827]'
                    : 'text-[#374151] hover:bg-[#f9fafb]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
