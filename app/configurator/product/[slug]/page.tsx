import Link from 'next/link'
import {
  attributeValueToLabel,
  filterVariantsBySelections,
  getConfiguratorBySlug,
  groupSpecsByDisplayGroup,
  parseMultiParam,
  pickAttribute,
  type AttributeDefinition,
  type ProductVariant,
} from '@/lib/catalog'
import {mediaImageUrl, sanityImageUrl, valueToToken} from '@/lib/sanity'
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
  token: string,
  single = false,
) {
  const next = new URLSearchParams(base.toString())
  const selected = parseMultiParam(next.get(definition.key))

  let updated: string[]

  if (single) {
    updated = selected.includes(token) ? [] : [token]
  } else {
    updated = selected.includes(token)
      ? selected.filter((item) => item !== token)
      : [...selected, token]
  }

  if (updated.length > 0) {
    next.set(definition.key, updated.join(','))
  } else {
    next.delete(definition.key)
  }

  next.set('page', '1')
  return next.toString()
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

function getColumnValue(variant: ProductVariant, key: string) {
  if (key === 'sku') {
    return variant.sku
  }

  const spec = pickAttribute(variant.specAttributes, key)
  const config = pickAttribute(variant.configSelections, key)

  return attributeValueToLabel(spec) || attributeValueToLabel(config) || '—'
}

function toValueTokens(value: ProductVariant['specAttributes'][number] | undefined) {
  if (!value) {
    return []
  }

  if (value.singleOptionValue?.value) {
    return [valueToToken(value.singleOptionValue.value)]
  }

  if (value.multiOptionValues?.length) {
    return value.multiOptionValues.map((item) => valueToToken(item.value))
  }

  if (typeof value.booleanValue === 'boolean') {
    return [String(value.booleanValue)]
  }

  if (typeof value.textValue === 'string' && value.textValue.length > 0) {
    return [valueToToken(value.textValue)]
  }

  if (typeof value.numberValue === 'number') {
    return [String(value.numberValue)]
  }

  return []
}

function buildPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({length: totalPages}, (_, index) => index + 1)
  }

  const items: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    items.push('ellipsis-left')
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right')
  }

  items.push(totalPages)
  return items
}

function getVariantAttributeValue(variant: ProductVariant | undefined, keys: string[]) {
  if (!variant) {
    return undefined
  }

  for (const key of keys) {
    const spec = pickAttribute(variant.specAttributes, key)
    const config = pickAttribute(variant.configSelections, key)
    const value = attributeValueToLabel(spec) || attributeValueToLabel(config)

    if (value) {
      return value
    }
  }

  return undefined
}

type GroupedSpec = {
  group: string
  items: Array<{label: string; value: string}>
}

function getGroupRows(groups: GroupedSpec[], matchers: string[]) {
  const loweredMatchers = matchers.map((item) => valueToToken(item))
  const selected = groups.filter((group) =>
    loweredMatchers.some((matcher) => valueToToken(group.group).includes(matcher)),
  )

  const seen = new Set<string>()
  const rows: Array<{label: string; value: string}> = []
  selected.forEach((group) => {
    group.items.forEach((item) => {
      const token = `${valueToToken(item.label)}::${valueToToken(item.value)}`
      if (!seen.has(token)) {
        seen.add(token)
        rows.push(item)
      }
    })
  })

  return rows
}

function keyIcon(type: 'power' | 'finish' | 'colour' | 'beam', colour = '#b8bcc5') {
  if (type === 'power') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M9.4 0.9 4.7 8h2.8L6.6 15l4.7-7H8.4z" fill="currentColor" />
      </svg>
    )
  }

  if (type === 'finish') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <defs>
          <linearGradient id="finish-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4f4f4" />
            <stop offset="1" stopColor="#a7abb4" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="url(#finish-grad)" />
        <path d="M2.4 12.8 12.8 2.4" stroke="#c7cad1" strokeWidth="1.1" />
      </svg>
    )
  }

  if (type === 'colour') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill={colour} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1.5 14.5 8 1.8l6.5 12.7z" fill="#b8bcc5" />
    </svg>
  )
}

export default async function ConfiguratorPage({
  params,
  searchParams,
}: {
  params: Promise<{slug: string}>
  searchParams: Promise<SearchParams>
}) {
  const [{slug}, rawSearch] = await Promise.all([params, searchParams])
  const {product, config, options} = await getConfiguratorBySlug(slug)

  if (!product) {
    return (
      <main className="page-wrap">
        <section className="section">
          <h3>Configurator not found</h3>
          <Link href="/products" className="btn" style={{marginTop: 10}}>
            Back to products
          </Link>
        </section>
      </main>
    )
  }

  const urlParams = asSearchParamsObject(rawSearch)

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

  config.filterDefinitions
    .filter((definition) => definition.valueType === 'number')
    .forEach((definition) => {
      const uniqueValues = new Set<number>()

      product.variants.forEach((variant) => {
        const attribute =
          pickAttribute(variant.configSelections, definition.key) ||
          pickAttribute(variant.specAttributes, definition.key)

        if (typeof attribute?.numberValue === 'number') {
          uniqueValues.add(attribute.numberValue)
        }
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

      const numericOptions = sortedValues.map((value) => {
        const valueToken = String(value)
        return {
          _id: `${definition._id}-${valueToken}`,
          label: formatNumericFilterLabel(value, definition.unit),
          value: valueToken,
          definitionRef: definition._id,
        }
      })

      numericFilterOptionsByDefinitionKey.set(definition.key, numericOptions)
    })

  const selectedFilters = config.filterDefinitions.reduce<Record<string, string[]>>((acc, definition) => {
    if (definition.valueType === 'number') {
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
    }

    acc[definition.key] = parseMultiParam(rawSearch[definition.key])
    return acc
  }, {})

  const stockedOnly = toSingle(rawSearch.stocked) === '1'
  const skuQuery = toSingle(rawSearch.q) || ''
  const requestedSkuId = toSingle(rawSearch.skuId)
  const normalizedRequestedSkuId = requestedSkuId ? valueToToken(requestedSkuId) : undefined

  const selectedVariantBySku =
    (requestedSkuId
      ? product.variants.find(
          (variant) =>
            variant._id === requestedSkuId ||
            valueToToken(variant.sku) === normalizedRequestedSkuId,
        )
      : undefined) ?? undefined

  const lockedFiltersFromSku = config.filterDefinitions.reduce<Record<string, string[]>>(
    (acc, definition) => {
      const specValue = pickAttribute(selectedVariantBySku?.specAttributes, definition.key)
      const configValue = pickAttribute(selectedVariantBySku?.configSelections, definition.key)
      const tokens = toValueTokens(specValue || configValue)

      if (tokens.length > 0) {
        acc[definition.key] = tokens
      }

      return acc
    },
    {},
  )

  const lockFiltersToSelectedSku = Boolean(selectedVariantBySku)
  const activeFilters = lockFiltersToSelectedSku ? lockedFiltersFromSku : selectedFilters
  const effectiveStockedOnly = lockFiltersToSelectedSku
    ? Boolean(selectedVariantBySku?.isStocked && stockedOnly)
    : stockedOnly

  const sizeParam = Number(toSingle(rawSearch.pageSize) || config.defaultPageSize)
  const pageSize = config.pageSizeOptions.includes(sizeParam) ? sizeParam : config.defaultPageSize

  const filteredVariants = filterVariantsBySelections(
    product.variants,
    activeFilters,
    effectiveStockedOnly,
    skuQuery,
  )

  const page = Number(toSingle(rawSearch.page) || '1')
  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const pagedVariants = filteredVariants.slice((safePage - 1) * pageSize, safePage * pageSize)

  const optionsByDefinition = new Map<string, typeof options>()
  options.forEach((option) => {
    const existing = optionsByDefinition.get(option.definitionRef) ?? []
    existing.push(option)
    optionsByDefinition.set(option.definitionRef, existing)
  })

  const visibleColumns =
    config.defaultVisibleColumns.length > 0 ? config.defaultVisibleColumns : config.tableColumns
  const nonSkuColumns = visibleColumns.filter((column) => column.key !== 'sku')

  const selectedVariant =
    selectedVariantBySku ||
    (requestedSkuId
      ? filteredVariants.find(
          (variant) =>
            variant._id === requestedSkuId ||
            valueToToken(variant.sku) === normalizedRequestedSkuId,
        )
      : undefined) ||
    undefined

  const featuredVariant = selectedVariant || pagedVariants[0] || filteredVariants[0]
  const previewMedia =
    (featuredVariant?.previewMedia && featuredVariant.previewMedia.length > 0
      ? featuredVariant.previewMedia
      : product.heroMedia) || []
  const previewUrl = mediaImageUrl(previewMedia[0], 960) || mediaImageUrl(featuredVariant?.previewMedia?.[0], 960)
  const previewThumbs = previewMedia.slice(0, 4)
  const featuredSpecGroups = groupSpecsByDisplayGroup(featuredVariant?.specAttributes)
  const powerValue = getVariantAttributeValue(featuredVariant, ['wattage', 'power'])
  const finishValue = getVariantAttributeValue(featuredVariant, ['finish', 'material'])
  const colourTempValue = getVariantAttributeValue(featuredVariant, ['colourTemperature'])
  const beamAngleValue = getVariantAttributeValue(featuredVariant, ['beamAngle'])
  const colourSwatch =
    colourTempValue?.includes('2700')
      ? '#f69a18'
      : colourTempValue?.includes('3000')
        ? '#f2b625'
        : colourTempValue?.includes('4000')
          ? '#ebd56d'
          : '#cfd2d9'

  const keyInfoItems = [
    powerValue
      ? {
          key: 'power',
          label: powerValue,
        }
      : null,
    finishValue
      ? {
          key: 'finish',
          label: finishValue,
        }
      : null,
    colourTempValue
      ? {
          key: 'colour',
          label: colourTempValue,
        }
      : null,
    beamAngleValue
      ? {
          key: 'beam',
          label: beamAngleValue,
        }
      : null,
  ].filter((item): item is {key: 'power' | 'finish' | 'colour' | 'beam'; label: string} => Boolean(item))

  const designRows = getGroupRows(featuredSpecGroups, ['design'])
  const performanceRows = getGroupRows(featuredSpecGroups, ['performance'])
  const driverRows = getGroupRows(featuredSpecGroups, ['driver'])
  const installationRows = getGroupRows(featuredSpecGroups, ['installation'])
  const hasActiveFilters =
    stockedOnly ||
    Boolean(skuQuery) ||
    Boolean(requestedSkuId) ||
    Object.values(activeFilters).some((values) => values.length > 0)
  const dataSheet = featuredVariant?.downloads?.find((item) => valueToToken(item.type).includes('data'))
  const fallbackDownload = featuredVariant?.downloads?.find((item) => item.externalUrl)

  const stockedParams = new URLSearchParams(urlParams.toString())
  if (stockedOnly) {
    stockedParams.delete('stocked')
  } else {
    stockedParams.set('stocked', '1')
  }
  stockedParams.set('page', '1')

  const startIndex = filteredVariants.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endIndex = Math.min(safePage * pageSize, filteredVariants.length)
  const clearSkuParams = new URLSearchParams(urlParams.toString())
  clearSkuParams.delete('skuId')
  const paginationItems = buildPaginationItems(safePage, totalPages)

  return (
    <main className="config-page cfg-page">
      <div className="cfg-layout">
        <aside className="cfg-left">
          <div className="cfg-left-head">
            <Link className="cfg-back-link" href={`/products/${product.slug}`}>
              Back
            </Link>
            {hasActiveFilters && (
              <Link className="cfg-reset-link" href={`/configurator/product/${product.slug}`}>
                Reset
              </Link>
            )}
          </div>

          <section className="cfg-block">
            <h4 className="cfg-block-title">Products in this collection</h4>
            <div className="cfg-model-scroll">
              {(product.availableModels || []).map((item) => {
                const modelImage = sanityImageUrl(item.listingCardImage, 260)

                return (
                  <Link
                    key={item._id}
                    href={`/configurator/product/${item.slug}`}
                    className={`cfg-model-card ${item.slug === product.slug ? 'active' : ''}`}
                  >
                    <div className="cfg-model-image">
                      {modelImage ? <img src={modelImage} alt={item.name} /> : <div className="product-placeholder" />}
                    </div>
                    <p>{item.name}</p>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="cfg-block">
            <h1 className="cfg-product-title">{product.name}</h1>
            {lockFiltersToSelectedSku ? (
              <span className={`cfg-stock-toggle locked ${effectiveStockedOnly ? 'active' : ''}`}>
                <span className="cfg-checkmark">{effectiveStockedOnly ? '✓' : ''}</span>
                Stocked/assembled products only
              </span>
            ) : (
              <Link
                className={`cfg-stock-toggle ${stockedOnly ? 'active' : ''}`}
                href={`/configurator/product/${product.slug}?${stockedParams.toString()}`}
              >
                <span className="cfg-checkmark">{stockedOnly ? '✓' : ''}</span>
                Stocked/assembled products only
              </Link>
            )}
          </section>

          {config.filterDefinitions.map((definition) => {
            const numericMeta = numericFilterMetaByDefinitionKey.get(definition.key)
            const definitionOptions =
              definition.valueType === 'number'
                ? numericFilterOptionsByDefinitionKey.get(definition.key) ?? []
                : optionsByDefinition.get(definition._id) ?? []
            const selected = activeFilters[definition.key] || []
            const singleSelect = definition.valueType === 'singleOption'

            return (
              <section key={definition._id} className="cfg-filter">
                <h5>{definition.title}</h5>
                {definition.valueType === 'number' && !lockFiltersToSelectedSku ? (
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
                ) : (
                  <div className="cfg-options">
                    {definitionOptions.map((option) => {
                      const token = valueToToken(option.value)
                      const active = selected.includes(token)
                      const paramsString = toggleFilter(urlParams, definition, token, singleSelect)
                      const isDisabled = lockFiltersToSelectedSku && !active

                      if (lockFiltersToSelectedSku) {
                        return (
                          <span
                            key={option._id}
                            className={`cfg-option ${active ? 'active' : ''} ${
                              isDisabled ? 'cfg-option-disabled' : 'cfg-option-locked'
                            }`}
                            aria-disabled={isDisabled}
                          >
                            {option.label}
                          </span>
                        )
                      }

                      return (
                        <Link
                          key={option._id}
                          href={`/configurator/product/${product.slug}?${paramsString}`}
                          className={`cfg-option ${active ? 'active' : ''}`}
                        >
                          {option.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </aside>

        <section className="cfg-main">
          <div className="cfg-top">
            <section className="cfg-preview-panel">
              <div className="cfg-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt={featuredVariant?.sku || product.name} />
                ) : (
                  <div className="product-placeholder" />
                )}
              </div>
              <div className="cfg-thumbs">
                {previewThumbs.map((item, index) => {
                  const thumb = mediaImageUrl(item, 160)
                  return (
                    <span key={index} className={`cfg-thumb ${index === 0 ? 'active' : ''}`}>
                      {thumb ? <img src={thumb} alt="" /> : <span className="cfg-thumb-dot" />}
                    </span>
                  )
                })}
              </div>
            </section>

            <aside className="cfg-action-panel">
              <div className="cfg-stock-row">
                <div>
                  <p className="cfg-stock-label">
                    {featuredVariant?.isStocked ? featuredVariant.stockLabel || 'Standard' : 'Made to order'}
                  </p>
                  <p className="meta">This item is generally stocked. Check with your distributor.</p>
                </div>
                <div className="cfg-icon-actions">
                  <button type="button" className="cfg-icon-btn">
                    +
                  </button>
                  <button type="button" className="cfg-icon-btn">
                    ♡
                  </button>
                </div>
              </div>

              <div className="cfg-distributor">Find your nearest distributor</div>

              <div className="cfg-download-row">
                <a
                  className="btn"
                  href={dataSheet?.externalUrl || '#'}
                  target={dataSheet?.externalUrl ? '_blank' : undefined}
                  rel={dataSheet?.externalUrl ? 'noreferrer' : undefined}
                >
                  Data sheet
                </a>
                <a
                  className="btn"
                  href={fallbackDownload?.externalUrl || '#'}
                  target={fallbackDownload?.externalUrl ? '_blank' : undefined}
                  rel={fallbackDownload?.externalUrl ? 'noreferrer' : undefined}
                >
                  Downloads
                </a>
              </div>

              <form method="get" className="cfg-search">
                <input
                  className="search-input"
                  type="text"
                  name="q"
                  defaultValue={skuQuery}
                  placeholder="Search SKU codes"
                />
                {Object.entries(rawSearch).map(([key, value]) => {
                  if (key === 'q' || key === 'page') {
                    return null
                  }

                  if (Array.isArray(value)) {
                    return value.map((item) => (
                      <input key={`${key}-${item}`} type="hidden" name={key} value={item} />
                    ))
                  }

                  if (!value) {
                    return null
                  }

                  return <input key={key} type="hidden" name={key} value={value} />
                })}
              </form>
            </aside>
          </div>

          {requestedSkuId && featuredVariant ? (
            <section className="cfg-bottom-panel cfg-detail-panel">
              <div className="cfg-detail-head">
                <Link
                  className="cfg-view-all"
                  href={`/configurator/product/${product.slug}?${clearSkuParams.toString()}`}
                >
                  <span aria-hidden="true">‹</span> View all SKUs
                </Link>
                <h2>{featuredVariant.sku}</h2>
              </div>

              <div className="cfg-detail-layout">
                <div className="cfg-detail-column">
                  <article className="cfg-detail-section">
                    <h3>Key Product Info</h3>
                    {keyInfoItems.length === 0 ? (
                      <p className="meta">No key product info available.</p>
                    ) : (
                      <div className="cfg-key-grid">
                        {keyInfoItems.map((item) => (
                          <div key={item.key} className="cfg-key-item">
                            <span className={`cfg-key-icon cfg-key-icon-${item.key}`} aria-hidden="true">
                              {item.key === 'colour'
                                ? keyIcon('colour', colourSwatch)
                                : item.key === 'power'
                                  ? keyIcon('power')
                                  : item.key === 'finish'
                                    ? keyIcon('finish')
                                    : keyIcon('beam')}
                            </span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>

                  <article className="cfg-detail-section">
                    <h3>Design Specifications</h3>
                    {designRows.length === 0 ? (
                      <p className="meta">No design specification rows available.</p>
                    ) : (
                      <dl className="cfg-spec-list">
                        {designRows.map((item) => (
                          <div key={`design-${item.label}-${item.value}`} className="cfg-spec-row">
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </article>
                </div>

                <div className="cfg-detail-column">
                  <article className="cfg-detail-section">
                    <h3>Performance Specifications</h3>
                    {performanceRows.length === 0 ? (
                      <p className="meta">No performance specification rows available.</p>
                    ) : (
                      <dl className="cfg-spec-list">
                        {performanceRows.map((item) => (
                          <div key={`performance-${item.label}-${item.value}`} className="cfg-spec-row">
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </article>
                </div>

                <div className="cfg-detail-column">
                  <article className="cfg-detail-section">
                    <h3>Driver</h3>
                    {driverRows.length === 0 ? (
                      <p className="meta">No driver rows available.</p>
                    ) : (
                      <dl className="cfg-spec-list">
                        {driverRows.map((item) => (
                          <div key={`driver-${item.label}-${item.value}`} className="cfg-spec-row">
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </article>

                  <article className="cfg-detail-section">
                    <h3>Installation Specifications</h3>
                    {installationRows.length === 0 ? (
                      <p className="meta">No installation rows available.</p>
                    ) : (
                      <dl className="cfg-spec-list">
                        {installationRows.map((item) => (
                          <div key={`install-${item.label}-${item.value}`} className="cfg-spec-row">
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </article>
                </div>
              </div>
            </section>
          ) : (
            <section className="cfg-bottom-panel cfg-table-panel">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product code</th>
                      {nonSkuColumns.map((column) => (
                        <th key={column._id}>{column.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedVariants.length === 0 && (
                      <tr>
                        <td colSpan={nonSkuColumns.length + 1}>
                          <span className="meta">No variants match these filters.</span>
                        </td>
                      </tr>
                    )}

                    {pagedVariants.map((variant) => (
                      <tr key={variant._id}>
                        <td>
                          {(() => {
                            const detailParams = new URLSearchParams(urlParams.toString())
                            detailParams.set('skuId', variant._id)

                            return (
                              <Link
                                className="cfg-sku-link"
                                href={`/configurator/product/${product.slug}?${detailParams.toString()}`}
                              >
                                {variant.sku}
                              </Link>
                            )
                          })()}
                        </td>
                        {nonSkuColumns.map((column) => (
                          <td key={`${variant._id}-${column._id}`}>
                            {getColumnValue(variant, column.key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="cfg-table-footer">
                <p className="cfg-results">
                  {startIndex} - {endIndex} of {filteredVariants.length}
                </p>

                <div className="cfg-pagination">
                  {safePage > 1 ? (
                    <Link
                      href={`/configurator/product/${product.slug}?${(() => {
                        const prevParams = new URLSearchParams(urlParams.toString())
                        prevParams.set('page', String(safePage - 1))
                        return prevParams.toString()
                      })()}`}
                      className="cfg-page-nav"
                    >
                      Prev
                    </Link>
                  ) : (
                    <span className="cfg-page-nav disabled">Prev</span>
                  )}

                  {paginationItems.map((item, index) => {
                    if (typeof item !== 'number') {
                      return (
                        <span key={`${item}-${index}`} className="cfg-page-ellipsis">
                          ...
                        </span>
                      )
                    }

                    const nextParams = new URLSearchParams(urlParams.toString())
                    nextParams.set('page', String(item))

                    return (
                      <Link
                        key={item}
                        href={`/configurator/product/${product.slug}?${nextParams.toString()}`}
                        className={`cfg-page-item ${item === safePage ? 'active' : ''}`}
                      >
                        {item}
                      </Link>
                    )
                  })}

                  {safePage < totalPages ? (
                    <Link
                      href={`/configurator/product/${product.slug}?${(() => {
                        const nextParams = new URLSearchParams(urlParams.toString())
                        nextParams.set('page', String(safePage + 1))
                        return nextParams.toString()
                      })()}`}
                      className="cfg-page-nav"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="cfg-page-nav disabled">Next</span>
                  )}
                </div>

                <div className="cfg-page-size">
                  {config.pageSizeOptions.map((size) => {
                    const nextParams = new URLSearchParams(urlParams.toString())
                    nextParams.set('pageSize', String(size))
                    nextParams.set('page', '1')

                    return (
                      <Link
                        key={size}
                        href={`/configurator/product/${product.slug}?${nextParams.toString()}`}
                        className={`cfg-page-item ${pageSize === size ? 'active' : ''}`}
                      >
                        {size}
                      </Link>
                    )
                  })}
                </div>

              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  )
}
