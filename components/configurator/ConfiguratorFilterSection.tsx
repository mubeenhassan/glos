import Link from 'next/link'
import type {ReactNode} from 'react'
import {type AttributeDefinition} from '@/lib/catalog'
import NumericRangeFilter from '@/components/NumericRangeFilter'
import {cx} from '@/components/cms/utils'
import {
  configuratorHref,
  toggleFilter,
} from '@/lib/configuratorFilters'
import {
  colourTemperatureSwatchColor,
  getConfiguratorChipGridClass,
  getConfiguratorFilterLayout,
  splitModelOptionLabel,
} from '@/lib/configuratorDisplay'
import {valueToToken} from '@/lib/sanity'

type FilterOption = {
  _id: string
  label: string
  value: string
}

type ConfiguratorFilterSectionProps = {
  definition: AttributeDefinition
  options: FilterOption[]
  selected: string[]
  singleSelect: boolean
  lockFiltersToSelectedSku: boolean
  productSlug: string
  urlParams: URLSearchParams
  numericMeta?: {
    minBound: number
    maxBound: number
    selectedMin: number
    selectedMax: number
    step: number
  }
}

function FilterOptionLink({
  href,
  className,
  locked,
  disabled,
  children,
}: {
  href?: string
  className: string
  locked: boolean
  disabled?: boolean
  children: ReactNode
}) {
  if (locked || !href) {
    return (
      <span className={className} aria-disabled={disabled || locked}>
        {children}
      </span>
    )
  }

  return (
    <Link href={href} className={className} scroll={false}>
      {children}
    </Link>
  )
}

function optionActiveClass(active: boolean, disabled?: boolean) {
  return cx(
    active &&
      'border-[#FB612E] bg-[#FFF7F3] font-semibold text-[#111827] shadow-[0_0_0_1px_#FB612E]',
    disabled && 'opacity-45',
  )
}

function chipOptionClass(active: boolean, disabled?: boolean) {
  return cx(
    'inline-flex min-h-9 items-center justify-center rounded-md border border-black/10 bg-white px-2 py-1.5 text-center text-sm leading-5 text-[#374151] transition-colors hover:border-black/20',
    optionActiveClass(active, disabled),
  )
}

function cardOptionClass(active: boolean, disabled?: boolean) {
  return cx(
    'grid min-h-[72px] content-center justify-items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-3 text-center text-sm leading-5 text-[#374151] transition-colors hover:border-black/20',
    optionActiveClass(active, disabled),
  )
}

function finishCardClass(active: boolean, disabled?: boolean) {
  return cx(
    'grid min-h-[72px] content-center justify-items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-2.5 text-center text-sm leading-5 text-[#374151] transition-colors hover:border-black/20',
    optionActiveClass(active, disabled),
  )
}

function colourPillClass(active: boolean, disabled?: boolean) {
  return cx(
    'inline-flex min-h-9 items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm leading-5 text-[#374151] transition-colors hover:border-black/20',
    optionActiveClass(active, disabled),
  )
}

export default function ConfiguratorFilterSection({
  definition,
  options,
  selected,
  singleSelect,
  lockFiltersToSelectedSku,
  productSlug,
  urlParams,
  numericMeta,
}: ConfiguratorFilterSectionProps) {
  const layout = getConfiguratorFilterLayout(definition)

  return (
    <section className="flex flex-col gap-3">
      <h5 className="m-0 text-sm font-bold leading-5 text-[#111827]">{definition.title}</h5>

      {layout === 'range' ? (
        lockFiltersToSelectedSku && numericMeta ? (
          <div className="filter-range filter-range-live pointer-events-none opacity-100">
            <div className="filter-range-track">
              <span className="filter-range-line" />
              <span
                className="filter-range-fill"
                style={{
                  left: `${((numericMeta.selectedMin - numericMeta.minBound) / Math.max(numericMeta.maxBound - numericMeta.minBound, numericMeta.step)) * 100}%`,
                  width: `${((numericMeta.selectedMax - numericMeta.selectedMin) / Math.max(numericMeta.maxBound - numericMeta.minBound, numericMeta.step)) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm leading-5 text-[#374151]">
              <span className="font-semibold text-[#111827]">
                {numericMeta.selectedMin}
                {definition.unit ? ` ${definition.unit}` : ''}
              </span>
              {numericMeta.selectedMin !== numericMeta.selectedMax ? (
                <span className="font-semibold text-[#111827]">
                  {numericMeta.selectedMax}
                  {definition.unit ? ` ${definition.unit}` : ''}
                </span>
              ) : null}
            </div>
          </div>
        ) : lockFiltersToSelectedSku ? (
          <p className="m-0 text-sm leading-5 text-[#6b7280]">Locked to selected product code.</p>
        ) : numericMeta ? (
          <NumericRangeFilter
            key={`${definition.key}-${numericMeta.selectedMin}-${numericMeta.selectedMax}`}
            paramKey={definition.key}
            minBound={numericMeta.minBound}
            maxBound={numericMeta.maxBound}
            selectedMin={numericMeta.selectedMin}
            selectedMax={numericMeta.selectedMax}
            step={numericMeta.step}
            unit={definition.unit}
          />
        ) : (
          <span className="text-sm leading-5 text-[#6b7280]">No numeric values configured</span>
        )
      ) : options.length === 0 ? (
        <span className="text-sm leading-5 text-[#6b7280]">No options configured</span>
      ) : layout === 'swatch' ? (
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => {
            const token = valueToToken(option.value)
            const active = selected.includes(token)
            const isDisabled = lockFiltersToSelectedSku && !active
            const href = lockFiltersToSelectedSku
              ? undefined
              : configuratorHref(
                  productSlug,
                  toggleFilter(urlParams, definition, token, singleSelect),
                )

            return (
              <FilterOptionLink
                key={option._id}
                href={href}
                locked={lockFiltersToSelectedSku}
                disabled={isDisabled}
                className={finishCardClass(active, isDisabled)}
              >
                <span>{option.label}</span>
              </FilterOptionLink>
            )
          })}
        </div>
      ) : layout === 'colour' ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const token = valueToToken(option.value)
            const active = selected.includes(token)
            const isDisabled = lockFiltersToSelectedSku && !active
            const href = lockFiltersToSelectedSku
              ? undefined
              : configuratorHref(
                  productSlug,
                  toggleFilter(urlParams, definition, token, singleSelect),
                )

            return (
              <FilterOptionLink
                key={option._id}
                href={href}
                locked={lockFiltersToSelectedSku}
                disabled={isDisabled}
                className={colourPillClass(active, isDisabled)}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-[2px] "
                  style={{backgroundColor: colourTemperatureSwatchColor(option.label)}}
                  aria-hidden="true"
                />
                <span>{option.label}</span>
              </FilterOptionLink>
            )
          })}
        </div>
      ) : layout === 'model' ? (
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const token = valueToToken(option.value)
            const active = selected.includes(token)
            const isDisabled = lockFiltersToSelectedSku && !active
            const href = lockFiltersToSelectedSku
              ? undefined
              : configuratorHref(
                  productSlug,
                  toggleFilter(urlParams, definition, token, singleSelect),
                )
            const {primary, secondary} = splitModelOptionLabel(option.label)

            return (
              <FilterOptionLink
                key={option._id}
                href={href}
                locked={lockFiltersToSelectedSku}
                disabled={isDisabled}
                className={cardOptionClass(active, isDisabled)}
              >
                <span className="font-semibold text-[#111827]">{primary}</span>
                {secondary ? (
                  <span className="text-xs leading-4 text-[#6b7280]">{secondary}</span>
                ) : null}
              </FilterOptionLink>
            )
          })}
        </div>
      ) : layout === 'accessory' ? (
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => {
            const token = valueToToken(option.value)
            const active = selected.includes(token)
            const isDisabled = lockFiltersToSelectedSku && !active
            const href = lockFiltersToSelectedSku
              ? undefined
              : configuratorHref(
                  productSlug,
                  toggleFilter(urlParams, definition, token, singleSelect),
                )

            return (
              <FilterOptionLink
                key={option._id}
                href={href}
                locked={lockFiltersToSelectedSku}
                disabled={isDisabled}
                className={finishCardClass(active, isDisabled)}
              >
                <span className="text-xs leading-4">{option.label}</span>
              </FilterOptionLink>
            )
          })}
        </div>
      ) : (
        <div className={cx('grid gap-2', getConfiguratorChipGridClass(definition))}>
          {options.map((option) => {
            const token = valueToToken(option.value)
            const active = selected.includes(token)
            const isDisabled = lockFiltersToSelectedSku && !active
            const href = lockFiltersToSelectedSku
              ? undefined
              : configuratorHref(
                  productSlug,
                  toggleFilter(urlParams, definition, token, singleSelect),
                )

            return (
              <FilterOptionLink
                key={option._id}
                href={href}
                locked={lockFiltersToSelectedSku}
                disabled={isDisabled}
                className={chipOptionClass(active, isDisabled)}
              >
                {option.label}
              </FilterOptionLink>
            )
          })}
        </div>
      )}
    </section>
  )
}
