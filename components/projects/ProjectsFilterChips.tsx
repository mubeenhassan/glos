'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useCallback, useTransition} from 'react'
import type {ProjectsCategoryFilter} from '@/lib/projects'

type Props = {
  categories: ProjectsCategoryFilter[]
  showAllFilter: boolean
  allFilterLabel: string
  activeValue: string | null
  basePath?: string
}

const chipBaseClass =
  'inline-flex min-h-[42px] shrink-0 items-center justify-center whitespace-nowrap text-[#374151] bg-[#FAFAFA] px-3 py-2 text-[13px] rounded-[8px] tracking-normal transition-all duration-300 cursor-pointer md:min-h-[48px] md:px-5 md:text-[14px]'

const chipInactiveClass =
  'border-[#f4f5f7] bg-[#fafafa] text-[#334155] hover:border-[#e7e9ee] hover:bg-[#f5f6f8]'

const chipActiveClass =
  'bg-[var(--color-brand-orange)] text-white hover:bg-[var(--color-brand-orange-hover)] hover:border-[var(--color-brand-orange-hover)]'

export default function ProjectsFilterChips({
  categories,
  showAllFilter,
  allFilterLabel,
  activeValue,
  basePath = '/projects',
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const setCategory = useCallback(
    (value: string | null) => {
      const next = new URLSearchParams(searchParams?.toString() || '')
      if (value) {
        next.set('category', value)
      } else {
        next.delete('category')
      }
      const qs = next.toString()
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath, {scroll: false})
      })
    },
    [basePath, router, searchParams],
  )

  return (
    <div
      className={`flex w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-[8px] bg-[#FAFAFA] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:inline-flex md:w-auto md:flex-wrap md:gap-0 md:overflow-hidden md:p-0 ${isPending ? 'opacity-70' : ''}`}
      role="tablist"
      aria-label="Filter projects by category"
    >
      {showAllFilter ? (
        <button
          type="button"
          role="tab"
          aria-selected={activeValue === null}
          className={`${chipBaseClass} ${activeValue === null ? chipActiveClass : chipInactiveClass}`}
          onClick={() => setCategory(null)}
        >
          {allFilterLabel}
        </button>
      ) : null}
      {categories.map((category) => {
        const isActive = category.value === activeValue
        return (
          <button
            key={category.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${chipBaseClass} ${isActive ? chipActiveClass : chipInactiveClass}`}
            onClick={() => setCategory(category.value)}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
