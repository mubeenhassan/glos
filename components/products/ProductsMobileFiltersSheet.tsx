'use client'

import {useEffect, useState, type ReactNode} from 'react'

const CLOSE_MOBILE_MENU_EVENT = 'glos:close-mobile-menu'
const CLOSE_MOBILE_FILTERS_EVENT = 'glos:close-mobile-filters'

type ProductsMobileFiltersSheetProps = {
  children: ReactNode
}

export default function ProductsMobileFiltersSheet({
  children,
}: ProductsMobileFiltersSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    function handleCloseFilters() {
      setIsOpen(false)
    }

    document.addEventListener(CLOSE_MOBILE_FILTERS_EVENT, handleCloseFilters)
    return () => {
      document.removeEventListener(CLOSE_MOBILE_FILTERS_EVENT, handleCloseFilters)
    }
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          document.dispatchEvent(new Event(CLOSE_MOBILE_MENU_EVENT))
          setIsOpen(true)
        }}
        className="flex items-center gap-1 text-[14px] font-[600] text-[#FB612E]"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 5h18M6 12h12M10 19h4" />
        </svg>
        Filters
      </button>

      {isOpen ? (
        <div className="fixed inset-0 lg:hidden" style={{zIndex: 1000001}}>
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-x-0 top-0 h-dvh overflow-auto bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="m-0 text-[18px] font-semibold text-[#111827]">
                Filters
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e7eb] text-[#374151]"
                aria-label="Close filters panel"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  )
}
