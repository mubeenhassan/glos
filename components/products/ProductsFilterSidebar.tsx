'use client'

import Link from 'next/link'
import {useState, type ReactNode} from 'react'

type ProductsFilterSidebarProps = {
  clearAllHref: string
  children: ReactNode
  collapseAfterIndex?: number
  defaultExpanded?: boolean
  showCollapseToggle?: boolean
  className?: string
}

export default function ProductsFilterSidebar({
  clearAllHref,
  children,
  collapseAfterIndex = 6,
  defaultExpanded = false,
  showCollapseToggle = true,
  className = '',
}: ProductsFilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <aside
      className={`products-filter-sidebar h-fit lg:sticky  lg:top-[88px] ${
        isExpanded ? '' : 'is-collapsed'
      } ${className}`}
      data-collapse-after={collapseAfterIndex}
    >
      <div className="mb-5 flex items-center justify-end">
        <Link href={clearAllHref} className="products-filter-action-link">
          Clear all
        </Link>
      </div>

      <div className="products-filter-sidebar-body">{children}</div>

      {showCollapseToggle ? (
        <div className="mt-5 flex justify-end border-t border-[#eceef2] pt-4">
          <button
            type="button"
            className="products-filter-action-link"
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? 'Less Filter' : 'More Filter'}
          </button>
        </div>
      ) : null}
    </aside>
  )
}
