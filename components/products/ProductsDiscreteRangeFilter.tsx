'use client'

import {useRouter} from 'next/navigation'

type ProductsDiscreteRangeFilterProps = {
  clearHref: string
  optionHrefs: string[]
  activeIndex: number
}

export default function ProductsDiscreteRangeFilter({
  clearHref,
  optionHrefs,
  activeIndex,
}: ProductsDiscreteRangeFilterProps) {
  const router = useRouter()
  const maxIndex = Math.max(optionHrefs.length - 1, 0)
  const sliderIndex = activeIndex >= 0 ? activeIndex + 1 : 0
  const stepCount = optionHrefs.length + 1
  const progress =
    stepCount > 1 ? (sliderIndex / (stepCount - 1)) * 100 : 0

  function onChange(nextStep: number) {
    const href = nextStep === 0 ? clearHref : optionHrefs[nextStep - 1]
    if (href) {
      router.push(href, {scroll: false})
    }
  }

  if (optionHrefs.length === 0) {
    return null
  }

  return (
    <div className="filter-range filter-range-live">
      <div className="filter-range-track">
        <span className="filter-range-line" />
        <span
          className="filter-range-fill"
          style={{width: `${progress}%`}}
        />
        <input
          className="filter-range-input"
          type="range"
          min={0}
          max={maxIndex + 1}
          step={1}
          value={sliderIndex}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="Filter range"
        />
      </div>
    </div>
  )
}
