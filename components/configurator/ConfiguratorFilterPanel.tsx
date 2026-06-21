import Link from 'next/link'
import type {AttributeDefinition, AttributeOption} from '@/lib/catalog'
import ConfiguratorFilterSection from '@/components/configurator/ConfiguratorFilterSection'
import {configuratorHref} from '@/lib/configuratorFilters'

type FilterOption = Omit<AttributeOption, 'definitionRef'> & {definitionRef?: string}

type ConfiguratorFilterPanelProps = {
  sidebarTitle: string
  hasActiveFilters: boolean
  clearFiltersHref: string
  showClearInHeader?: boolean
  enableStockOnlyToggle: boolean
  lockFiltersToSelectedSku: boolean
  effectiveStockedOnly: boolean
  stockedOnly: boolean
  stockedParams: URLSearchParams
  stockCheckClass: (active: boolean) => string
  filterDefinitions: AttributeDefinition[]
  numericFilterMetaByDefinitionKey: Map<
    string,
    {
      minBound: number
      maxBound: number
      selectedMin: number
      selectedMax: number
      step: number
    }
  >
  numericFilterOptionsByDefinitionKey: Map<string, FilterOption[]>
  optionsByDefinition: Map<string, FilterOption[]>
  activeFilters: Record<string, string[]>
  productSlug: string
  urlParams: URLSearchParams
}

export default function ConfiguratorFilterPanel({
  sidebarTitle,
  hasActiveFilters,
  clearFiltersHref,
  showClearInHeader = true,
  enableStockOnlyToggle,
  lockFiltersToSelectedSku,
  effectiveStockedOnly,
  stockedOnly,
  stockedParams,
  stockCheckClass,
  filterDefinitions,
  numericFilterMetaByDefinitionKey,
  numericFilterOptionsByDefinitionKey,
  optionsByDefinition,
  activeFilters,
  productSlug,
  urlParams,
}: ConfiguratorFilterPanelProps) {
  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <div className="flex w-full items-start justify-between gap-3">
          <h2 className="m-0 text-sm font-bold leading-5 text-[#111827]">{sidebarTitle}</h2>
          {showClearInHeader && hasActiveFilters ? (
            <Link
              className="whitespace-nowrap text-sm font-semibold text-[#FB612E] hover:text-[#FB612E]"
              href={clearFiltersHref}
              scroll={false}
            >
              Clear all
            </Link>
          ) : null}
        </div>

        {enableStockOnlyToggle ? (
          lockFiltersToSelectedSku ? (
            <span className="flex w-full cursor-default flex-row items-start gap-3">
              <span className="flex h-5 w-4 shrink-0 items-center pt-1">
                <span
                  className={[
                    'inline-flex h-4 w-4 items-center justify-center rounded-[2.5px] border text-[10px] text-white',
                    stockCheckClass(effectiveStockedOnly),
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {effectiveStockedOnly ? '✓' : ''}
                </span>
              </span>
              <span className="text-sm font-normal leading-5 text-[#374151]">
                Stocked/Assembled Products Only
              </span>
            </span>
          ) : (
            <Link
              className="flex w-full flex-row items-start gap-3"
              href={configuratorHref(productSlug, stockedParams.toString())}
              scroll={false}
            >
              <span className="flex h-5 w-4 shrink-0 items-center pt-1">
                <span
                  className={[
                    'inline-flex h-4 w-4 items-center justify-center rounded-[2.5px] border text-[10px] text-white',
                    stockCheckClass(stockedOnly),
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {stockedOnly ? '✓' : ''}
                </span>
              </span>
              <span className="text-sm font-normal leading-5 text-[#374151]">
                Stocked/Assembled Products Only
              </span>
            </Link>
          )
        ) : null}
      </div>

      {filterDefinitions.map((definition) => {
        const numericMeta = numericFilterMetaByDefinitionKey.get(definition.key)
        const definitionOptions =
          definition.valueType === 'number'
            ? (numericFilterOptionsByDefinitionKey.get(definition.key) ?? [])
            : (optionsByDefinition.get(definition._id) ?? [])
        const selected = activeFilters[definition.key] || []
        const singleSelect = definition.valueType === 'singleOption'

        return (
          <ConfiguratorFilterSection
            key={definition._id}
            definition={definition}
            options={definitionOptions}
            selected={selected}
            singleSelect={singleSelect}
            lockFiltersToSelectedSku={lockFiltersToSelectedSku}
            productSlug={productSlug}
            urlParams={urlParams}
            numericMeta={numericMeta}
          />
        )
      })}
    </>
  )
}
