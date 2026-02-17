import Link from 'next/link'
import {
  attributeValueToLabel,
  filterVariantsBySelections,
  getListingData,
  parseMultiParam,
  pickAttribute,
  type AttributeDefinition,
} from '@/lib/catalog'
import {sanityImageUrl, valueToToken} from '@/lib/sanity'
import NumericRangeFilter from '@/components/NumericRangeFilter'

type SearchParams = Record<string, string | string[] | undefined>

function toSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function asSearchParamsObject(raw: SearchParams) {
  const params = new URLSearchParams()

  Object.entries(raw).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
      return
    }

    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value)
    }
  })

  return params
}

function toggleFilter(
  base: URLSearchParams,
  definition: AttributeDefinition,
  value: string,
  single = false,
) {
  const next = new URLSearchParams(base.toString())
  const selected = parseMultiParam(next.get(definition.key))

  let updated: string[]

  if (single) {
    updated = selected.includes(value) ? [] : [value]
  } else {
    updated = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
  }

  if (updated.length === 0) {
    next.delete(definition.key)
  } else {
    next.set(definition.key, updated.join(','))
  }

  next.set('page', '1')

  return `/products?${next.toString()}`
}

function clearFilter(base: URLSearchParams, key: string) {
  const next = new URLSearchParams(base.toString())
  next.delete(key)
  next.set('page', '1')
  return `/products?${next.toString()}`
}

function parseNumberFromToken(token: string) {
  const match = token.match(/-?\d+(\.\d+)?/)
  return match ? Number(match[0]) : Number.NaN
}

function formatNumericFilterLabel(value: number, unit?: string) {
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '')
  return unit ? `${formatted} ${unit}` : formatted
}

function formatNumericParamValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

function parseNumericRangeParam(
  rawValue: string | string[] | undefined,
  minBound: number,
  maxBound: number,
) {
  const value = toSingle(rawValue)
  if (!value) {
    return null
  }

  const match = value.match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/)
  if (!match) {
    return null
  }

  let min = Number(match[1])
  let max = Number(match[2])

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return null
  }

  if (min > max) {
    ;[min, max] = [max, min]
  }

  const clampedMin = Math.max(minBound, Math.min(min, maxBound))
  const clampedMax = Math.max(minBound, Math.min(max, maxBound))
  return {
    min: clampedMin,
    max: clampedMax,
  }
}

function swatchColor(label: string) {
  const token = valueToToken(label)
  if (token.includes('black')) return '#1d1e22'
  if (token.includes('white')) return '#f3f3f3'
  if (token.includes('grey') || token.includes('gray')) return '#b8bac0'
  if (token.includes('gold')) return '#b58b4d'
  if (token.includes('aluminium') || token.includes('aluminum')) return '#c8cacf'
  if (token.includes('bronze')) return '#7f6550'
  return '#cfd2d8'
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const [rawSearch, listingData] = await Promise.all([searchParams, getListingData()])

  const urlParams = asSearchParamsObject(rawSearch)
  const configuredTabs = (listingData.config.tabs || []).filter(
    (tab): tab is NonNullable<typeof tab> => Boolean(tab?.key && tab?.label),
  )
  const listingTabs =
    configuredTabs.length > 0
      ? configuredTabs
      : [{_key: 'all', key: 'all', label: 'All Products', mode: 'all' as const}]
  const requestedTab = toSingle(rawSearch.tab)
  const activeTabConfig = listingTabs.find((item) => item.key === requestedTab) || listingTabs[0]
  const activeTabKey = activeTabConfig?.key || 'all'
  const stockOnlyMode = activeTabConfig?.mode === 'inStock'
  const sort = toSingle(rawSearch.sort) || listingData.config.defaultSort || 'recommended'
  const page = Number(toSingle(rawSearch.page) || '1')
  const pageSize = listingData.config.itemsPerPage || 24

  const numericFilterMetaByDefinitionKey = new Map<
    string,
    {
      minBound: number
      maxBound: number
      selectedMin: number
      selectedMax: number
      step: number
    }
  >()

  const numericFilterOptionsByDefinitionKey = new Map<
    string,
    { _id: string; label: string; value: string; definitionRef: string }[]
  >()

  ;(listingData.config.filterDefinitions || [])
    .filter((definition) => definition.valueType === 'number')
    .forEach((definition) => {
      const uniqueValues = new Set<number>()

      listingData.products.forEach((product) => {
        product.variants.forEach((variant) => {
          const attribute =
            pickAttribute(variant.configSelections, definition.key) ||
            pickAttribute(variant.specAttributes, definition.key)
          if (typeof attribute?.numberValue === 'number') {
            uniqueValues.add(attribute.numberValue)
          }
        })
      })

      const sortedValues = Array.from(uniqueValues).sort((a, b) => a - b)
      if (sortedValues.length > 0) {
        const minBound = sortedValues[0]
        const maxBound = sortedValues[sortedValues.length - 1]
        const selectedRange = parseNumericRangeParam(rawSearch[definition.key], minBound, maxBound)
        numericFilterMetaByDefinitionKey.set(definition.key, {
          minBound,
          maxBound,
          selectedMin: selectedRange?.min ?? minBound,
          selectedMax: selectedRange?.max ?? maxBound,
          step: sortedValues.some((value) => !Number.isInteger(value)) ? 0.1 : 1,
        })
      }

      const options = sortedValues.map((value) => {
        const valueToken = String(value)
        return {
          _id: `${definition._id}-${valueToken}`,
          label: formatNumericFilterLabel(value, definition.unit),
          value: valueToken,
          definitionRef: definition._id,
        }
      })

      numericFilterOptionsByDefinitionKey.set(definition.key, options)
    })

  const selectedFilters = (listingData.config.filterDefinitions || []).reduce<
    Record<string, string[]>
  >((acc, definition) => {
    if (definition.valueType !== 'number') {
      acc[definition.key] = parseMultiParam(rawSearch[definition.key])
      return acc
    }

    const meta = numericFilterMetaByDefinitionKey.get(definition.key)
    if (!meta) {
      acc[definition.key] = []
      return acc
    }

    const hasActiveRange = meta.selectedMin !== meta.minBound || meta.selectedMax !== meta.maxBound
    acc[definition.key] = hasActiveRange
      ? [`${formatNumericParamValue(meta.selectedMin)}-${formatNumericParamValue(meta.selectedMax)}`]
      : []
    return acc
  }, {})

  const filteredProducts = listingData.products
    .map((product) => {
      const matchingVariants = filterVariantsBySelections(
        product.variants,
        selectedFilters,
        stockOnlyMode,
      )

      if (matchingVariants.length === 0) {
        return null
      }

      return {
        ...product,
        matchingVariants,
      }
    })
    .filter((product): product is NonNullable<typeof product> => Boolean(product))

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'nameAsc') {
      return a.name.localeCompare(b.name)
    }

    if (sort === 'nameDesc') {
      return b.name.localeCompare(a.name)
    }

    if (sort === 'newest') {
      if (a.isNew === b.isNew) {
        return a.name.localeCompare(b.name)
      }

      return a.isNew ? -1 : 1
    }

    return (a.sortPriority ?? 9999) - (b.sortPriority ?? 9999)
  })

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedProducts = sortedProducts.slice(startIndex, startIndex + pageSize)

  const baseForReset = new URLSearchParams()
  if (sort) {
    baseForReset.set('sort', sort)
  }
  if (activeTabKey) {
    baseForReset.set('tab', activeTabKey)
  }

  return (
    <main className="page-wrap catalog-page">
      <div className="grid-shell">
        <aside className="panel filters">
          <h3>Filters</h3>

          <div className="chip-wrap" style={{marginBottom: '10px'}}>
            {listingTabs.map((tabItem) => (
              <Link
                key={tabItem._key || tabItem.key}
                href={`/products?${new URLSearchParams({
                  ...Object.fromEntries(urlParams.entries()),
                  tab: tabItem.key,
                  page: '1',
                }).toString()}`}
                className={`chip ${activeTabKey === tabItem.key ? 'chip-active' : ''}`}
              >
                {tabItem.label}
              </Link>
            ))}
          </div>

          {(listingData.config.filterDefinitions || []).map((definition) => {
            const numericMeta = numericFilterMetaByDefinitionKey.get(definition.key)
            const options =
              definition.valueType === 'number'
                ? numericFilterOptionsByDefinitionKey.get(definition.key) || []
                : listingData.options.filter((option) => option.definitionRef === definition._id)
            const selected = selectedFilters[definition.key] || []
            const singleSelect = definition.valueType === 'singleOption'
            const selectedLabels = options
              .filter((option) => selected.includes(valueToToken(option.value)))
              .map((option) => option.label)
            const control = definition.uiControl || 'chips'
            const clearHref = clearFilter(urlParams, definition.key)
            const sortedRangeOptions = [...options].sort((a, b) => {
              const aNumber = parseNumberFromToken(a.value || a.label)
              const bNumber = parseNumberFromToken(b.value || b.label)
              if (Number.isNaN(aNumber) || Number.isNaN(bNumber)) {
                return a.label.localeCompare(b.label)
              }
              return aNumber - bNumber
            })
            const activeRangeIndex = sortedRangeOptions.findIndex((option) =>
              selected.includes(valueToToken(option.value)),
            )
            const rangeProgress =
              sortedRangeOptions.length > 1 && activeRangeIndex >= 0
                ? (activeRangeIndex / (sortedRangeOptions.length - 1)) * 100
                : 100

            return (
              <div className="filter-block" key={definition._id}>
                <h4 className="filter-title">{definition.title}</h4>
                {definition.valueType === 'number' && control === 'range' ? (
                  numericMeta ? (
                    <NumericRangeFilter
                      paramKey={definition.key}
                      minBound={numericMeta.minBound}
                      maxBound={numericMeta.maxBound}
                      selectedMin={numericMeta.selectedMin}
                      selectedMax={numericMeta.selectedMax}
                      step={numericMeta.step}
                      unit={definition.unit}
                    />
                  ) : (
                    <span className="meta">No numeric values configured</span>
                  )
                ) : options.length === 0 ? (
                  <span className="meta">No options configured</span>
                ) : control === 'dropdown' ? (
                  <details className="filter-dropdown">
                    <summary>
                      <span>{selectedLabels[0] || 'Any'}</span>
                      <span className="filter-caret">⌄</span>
                    </summary>
                    <div className="filter-dropdown-menu">
                      <Link href={clearHref} className={`filter-dropdown-item ${selected.length === 0 ? 'active' : ''}`}>
                        Any
                      </Link>
                      {options.map((option) => {
                        const token = valueToToken(option.value)
                        const isActive = selected.includes(token)
                        return (
                          <Link
                            key={option._id}
                            href={toggleFilter(urlParams, definition, token, true)}
                            className={`filter-dropdown-item ${isActive ? 'active' : ''}`}
                          >
                            {option.label}
                          </Link>
                        )
                      })}
                    </div>
                  </details>
                ) : control === 'range' ? (
                  <div className="filter-range">
                    <div className="filter-range-track">
                      <span className="filter-range-line" />
                      <span className="filter-range-fill" style={{width: `${rangeProgress}%`}} />
                      <span className="filter-range-thumb left" />
                      <span className="filter-range-thumb right" />
                    </div>
                    <div className="filter-range-caption-row">
                      <Link href={clearHref} className="filter-any-link">
                        {selectedLabels[0] || 'Any'}
                      </Link>
                    </div>
                    <div className="filter-range-values">
                      {sortedRangeOptions.map((option) => {
                        const token = valueToToken(option.value)
                        const isActive = selected.includes(token)
                        return (
                          <Link
                            key={option._id}
                            href={toggleFilter(urlParams, definition, token, true)}
                            className={`range-value ${isActive ? 'active' : ''}`}
                          >
                            {option.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : control === 'swatch' ? (
                  <div className="filter-check-list">
                    {options.map((option) => {
                      const token = valueToToken(option.value)
                      const isActive = selected.includes(token)
                      return (
                        <Link
                          key={option._id}
                          href={toggleFilter(urlParams, definition, token, singleSelect)}
                          className={`filter-check-item ${isActive ? 'active' : ''}`}
                        >
                          <span
                            className="filter-swatch"
                            style={{backgroundColor: swatchColor(option.label)}}
                            aria-hidden="true"
                          />
                          <span>{option.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : definition.valueType === 'multiOption' ? (
                  <div className="filter-check-list">
                    {options.map((option) => {
                      const token = valueToToken(option.value)
                      const isActive = selected.includes(token)

                      return (
                        <Link
                          key={option._id}
                          href={toggleFilter(urlParams, definition, token, false)}
                          className={`filter-check-item ${isActive ? 'active' : ''}`}
                        >
                          <span className="filter-checkbox" aria-hidden="true" />
                          <span>{option.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="filter-chip-list">
                    {options.map((option) => {
                      const normalizedValue = valueToToken(option.value)
                      const isActive = selected.includes(normalizedValue)

                      return (
                        <Link
                          key={option._id}
                          href={toggleFilter(
                            urlParams,
                            definition,
                            normalizedValue,
                            singleSelect,
                          )}
                          className={`chip ${isActive ? 'chip-active' : ''}`}
                        >
                          {option.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <div className="filter-block">
            <Link href={`/products?${baseForReset.toString()}`} className="chip">
              Reset Filters
            </Link>
          </div>
        </aside>

        <section className="panel catalog-main">
          <div className="catalog-top">
            <div>
              <h2>All products</h2>
              <p className="meta">
                Showing {pagedProducts.length} of {sortedProducts.length}
              </p>
            </div>
            <div className="chip-wrap">
              <Link
                href={`/products?${new URLSearchParams({
                  ...Object.fromEntries(urlParams.entries()),
                  sort: 'recommended',
                  page: '1',
                }).toString()}`}
                className={`chip ${sort === 'recommended' ? 'chip-active' : ''}`}
              >
                Recommended
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...Object.fromEntries(urlParams.entries()),
                  sort: 'newest',
                  page: '1',
                }).toString()}`}
                className={`chip ${sort === 'newest' ? 'chip-active' : ''}`}
              >
                Newest
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...Object.fromEntries(urlParams.entries()),
                  sort: 'nameAsc',
                  page: '1',
                }).toString()}`}
                className={`chip ${sort === 'nameAsc' ? 'chip-active' : ''}`}
              >
                A-Z
              </Link>
            </div>
          </div>

          <div className="products-grid">
            {pagedProducts.map((product) => {
              const imageUrl = sanityImageUrl(product.listingCardImage, 620)
              const sampleVariant = product.matchingVariants[0]

              return (
                <article key={product._id} className="product-card">
                  <Link
                    href={`/configurator/product/${product.slug}`}
                    className="product-config-link"
                    aria-label={`Open ${product.name} configurator`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M10 3H3v7h7V3Zm11 0h-7v7h7V3ZM10 14H3v7h7v-7Zm11 3.5-2.2-.4-.8-1.9 1.3-1.8-1.4-1.4-1.8 1.3-1.9-.8-.4-2.2h-2l-.4 2.2-1.9.8-1.8-1.3-1.4 1.4 1.3 1.8-.8 1.9-2.2.4v2l2.2.4.8 1.9-1.3 1.8 1.4 1.4 1.8-1.3 1.9.8.4 2.2h2l.4-2.2 1.9-.8 1.8 1.3 1.4-1.4-1.3-1.8.8-1.9 2.2-.4v-2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>

                  <Link href={`/products/${product.slug}`} className="product-card-main">
                    <div className="product-visual">
                      {imageUrl ? <img src={imageUrl} alt={product.name} /> : <div className="product-placeholder" />}
                    </div>

                    {(product.listingBadgeText || product.isNew) && (
                      <span className="badge">{product.listingBadgeText || 'NEW'}</span>
                    )}

                    <h3 className="product-name">{product.name}</h3>

                    <p className="product-meta">{product.family}</p>

                    <div className="chip-wrap">
                      {(listingData.config.cardAttributeDefinitions || []).slice(0, 2).map((definition) => {
                        const value =
                          attributeValueToLabel(pickAttribute(sampleVariant.configSelections, definition.key)) ||
                          attributeValueToLabel(pickAttribute(sampleVariant.specAttributes, definition.key))

                        if (!value) {
                          return null
                        }

                        return (
                          <span key={definition._id} className="chip">
                            {definition.title}: {value}
                          </span>
                        )
                      })}
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          <div className="catalog-top" style={{paddingTop: 0}}>
            <p className="meta">
              Page {safePage} of {totalPages}
            </p>
            <div className="chip-wrap">
              {Array.from({length: totalPages}).map((_, index) => {
                const pageNumber = index + 1
                const params = new URLSearchParams(urlParams.toString())
                params.set('page', String(pageNumber))

                return (
                  <Link
                    key={pageNumber}
                    href={`/products?${params.toString()}`}
                    className={`chip ${pageNumber === safePage ? 'chip-active' : ''}`}
                  >
                    {pageNumber}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
