'use client'

import {useMemo, useState} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'

type NumericRangeFilterProps = {
  paramKey: string
  minBound: number
  maxBound: number
  selectedMin: number
  selectedMax: number
  step: number
  unit?: string
}

function formatRangeValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function NumericRangeFilter({
  paramKey,
  minBound,
  maxBound,
  selectedMin,
  selectedMax,
  step,
  unit,
}: NumericRangeFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [minValue, setMinValue] = useState(selectedMin)
  const [maxValue, setMaxValue] = useState(selectedMax)

  const progress = useMemo(() => {
    const span = Math.max(maxBound - minBound, step)
    const start = ((minValue - minBound) / span) * 100
    const end = ((maxValue - minBound) / span) * 100
    return {start: clamp(start, 0, 100), end: clamp(end, 0, 100)}
  }, [minBound, maxBound, minValue, maxValue, step])

  function commit(nextMin: number, nextMax: number) {
    const normalizedMin = clamp(Math.min(nextMin, nextMax), minBound, maxBound)
    const normalizedMax = clamp(Math.max(nextMin, nextMax), minBound, maxBound)
    const params = new URLSearchParams(searchParams.toString())

    if (normalizedMin === minBound && normalizedMax === maxBound) {
      params.delete(paramKey)
    } else {
      params.set(paramKey, `${formatRangeValue(normalizedMin)}-${formatRangeValue(normalizedMax)}`)
    }

    params.set('page', '1')
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, {scroll: false})
  }

  return (
    <div className="filter-range filter-range-live">
      <div className="filter-range-track">
        <span className="filter-range-line" />
        <span
          className="filter-range-fill"
          style={{left: `${progress.start}%`, width: `${Math.max(progress.end - progress.start, 0)}%`}}
        />
        <input
          className="filter-range-input"
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={minValue}
          onChange={(event) => {
            const next = Number(event.target.value)
            setMinValue(Math.min(next, maxValue))
          }}
          onMouseUp={() => commit(minValue, maxValue)}
          onTouchEnd={() => commit(minValue, maxValue)}
          aria-label={`${paramKey} minimum`}
        />
        <input
          className="filter-range-input"
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={maxValue}
          onChange={(event) => {
            const next = Number(event.target.value)
            setMaxValue(Math.max(next, minValue))
          }}
          onMouseUp={() => commit(minValue, maxValue)}
          onTouchEnd={() => commit(minValue, maxValue)}
          aria-label={`${paramKey} maximum`}
        />
      </div>
      <div className="filter-range-caption-row sr-only">
        <span className="meta">
          {formatRangeValue(minValue)}
          {unit ? ` ${unit}` : ''} - {formatRangeValue(maxValue)}
          {unit ? ` ${unit}` : ''}
        </span>
        <button
          type="button"
          className="filter-any-link"
          onClick={() => {
            setMinValue(minBound)
            setMaxValue(maxBound)
            commit(minBound, maxBound)
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
