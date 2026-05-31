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
  finishSwatchColor,
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

function FinishFixtureIcon({label}: {label: string}) {
  return (
    <div
      className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-black/5"
      style={{backgroundColor: finishSwatchColor(label)}}
      aria-hidden="true"
    >
      <div className="h-4 w-4 rounded-full bg-white/70" />
    </div>
  )
}

function ModelFixtureIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <circle cx="20" cy="20" r="11" fill="#d9dce2" />
      <circle cx="20" cy="20" r="5.5" fill="#f4f5f7" />
    </svg>
  )
}

function AccessoryFixtureIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect x="6" y="10" width="20" height="12" rx="2" fill="#d9dce2" />
      <path d="M10 14h12M10 18h8" stroke="#f7f7f8" strokeWidth="1.5" />
    </svg>
  )
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
    'grid min-h-[104px] content-center justify-items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2 py-3 text-center text-sm leading-5 text-[#374151] transition-colors hover:border-black/20',
    optionActiveClass(active, disabled),
  )
}

function finishCardClass(active: boolean, disabled?: boolean) {
  return cx(
    'grid min-h-[96px] content-end justify-items-center gap-2 rounded-lg border border-black/10 bg-white px-2 py-2.5 text-center text-sm leading-5 text-[#374151] transition-colors hover:border-black/20',
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
        lockFiltersToSelectedSku ? (
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
                <FinishFixtureIcon label={option.label} />
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
                <ModelFixtureIcon />
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
                <AccessoryFixtureIcon />
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
