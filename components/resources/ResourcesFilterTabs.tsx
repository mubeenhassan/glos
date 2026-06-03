'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useCallback, useTransition} from 'react'
import type {ResourcesDownloadTab} from '@/lib/resources'

type Props = {
  tabs: ResourcesDownloadTab[]
  activeValue: string
  basePath?: string
  queryParam?: string
}

const tabBaseClass =
  'inline-flex min-h-[42px] shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] px-4 py-2 text-[13px] font-medium tracking-normal transition-all duration-300 cursor-pointer md:min-h-[48px] md:px-5 md:text-[14px]'

const tabInactiveClass =
  'bg-transparent text-[#374151] hover:bg-white/80'

const tabActiveClass =
  'bg-[var(--color-brand-orange)] text-white shadow-sm hover:bg-[var(--color-brand-orange-hover)]'

export default function ResourcesFilterTabs({
  tabs,
  activeValue,
  basePath = '/resources',
  queryParam = 'tab',
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const setTab = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams?.toString() || '')
      next.set(queryParam, value)
      startTransition(() => {
        router.push(`${basePath}?${next.toString()}`, {scroll: false})
      })
    },
    [basePath, queryParam, router, searchParams],
  )

  return (
    <div
      className={`inline-flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-[8px] bg-[#FAFAFA] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:flex-wrap ${isPending ? 'opacity-70' : ''}`}
      role="tablist"
      aria-label="Filter downloads"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${tabBaseClass} ${isActive ? tabActiveClass : tabInactiveClass}`}
            onClick={() => setTab(tab.value)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
