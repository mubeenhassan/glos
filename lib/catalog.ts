import {cleanSanityString, fetchSanity, type SanityImage, valueToToken} from '@/lib/sanity'

export type AttributeDefinition = {
  _id: string
  key: string
  title: string
  valueType: 'number' | 'boolean' | 'text' | 'singleOption' | 'multiOption'
  unit?: string
  uiControl?: string
  displayGroup?: string
  displayOrder?: number
}

export type AttributeOption = {
  _id: string
  label: string
  value: string
  order?: number
  definitionRef: string
  swatchHex?: string
  swatchImage?: SanityImage
}

export type AttributeValue = {
  definition?: AttributeDefinition
  numberValue?: number
  numberTextValue?: string
  booleanValue?: boolean
  textValue?: string
  singleOptionValue?: {
    _id: string
    label: string
    value: string
  }
  multiOptionValues?: {
    _id: string
    label: string
    value: string
  }[]
}

export type ResourceAsset = {
  _id: string
  title: string
  type: string
  externalUrl?: string
  fileUrl?: string
  fileByteSize?: number
  fileSizeLabel?: string
  downloadLabel?: string
}

export type MediaItem = {
  _key?: string
  type: 'image' | 'video'
  image?: SanityImage
  externalImageUrl?: string
  videoUrl?: string
}

export type ProductCard = {
  _id: string
  name: string
  slug: string
  shortDescription?: string
  isNew?: boolean
  isInStock?: boolean
  listingBadgeText?: string
  sortPriority?: number
  listingCardImage?: SanityImage
  category?: string
  family?: string
  variants: ProductVariant[]
}

export type ProductVariant = {
  _id: string
  sku: string
  status: 'active' | 'inactive' | 'discontinued'
  isStocked?: boolean
  stockLabel?: string
  tableSortOrder?: number
  previewMedia?: MediaItem[]
  configSelections: AttributeValue[]
  specAttributes: AttributeValue[]
  downloads?: ResourceAsset[]
}

export type ProductOverview = {
  heading?: string
  description?: string
  slides?: {
    key: string
    image?: SanityImage
    alt: string
    hotspots: {
      key: string
      x: number
      y: number
      product: {
        _id: string
        name: string
        slug: string
        shortDescription?: string
        listingBadgeText?: string
      } | null
    }[]
  }[]
  highlights?: {
    key: string
    title: string
    description: string
    icon?: SanityImage
  }[]
  splitFeature?: {
    heading: string
    description: string
    images: {
      key: string
      image?: SanityImage
      alt: string
    }[]
  }
}

export type ListingConfig = {
  defaultSort?: 'recommended' | 'newest' | 'nameAsc' | 'nameDesc'
  itemsPerPage?: number
  tabs?: {
    _key: string
    label: string
    key: string
    mode: 'all' | 'inStock' | 'custom'
  }[]
  filterDefinitions?: AttributeDefinition[]
  cardAttributeDefinitions?: AttributeDefinition[]
}

export type ProductDetail = {
  _id: string
  name: string
  slug: string
  shortDescription?: string
  heroDescription?: string
  listingBadgeText?: string
  brand?: string
  category?: string
  family?: string
  heroMedia?: MediaItem[]
  overview?: ProductOverview
  productAttributes?: AttributeValue[]
  resources?: ResourceAsset[]
  featureBlocks?: {
    _key: string
    title: string
    description?: string
    alignment?: 'left' | 'right'
    media?: MediaItem
  }[]
  iconHighlights?: {
    _key: string
    title: string
    description?: string
    icon?: SanityImage
  }[]
  perfectFor?: {
    _id: string
    title: string
    description?: string
    image?: SanityImage
  }[]
  relatedProducts?: {
    _id: string
    name: string
    slug: string
    listingCardImage?: SanityImage
    listingBadgeText?: string
  }[]
  availableModels?: {
    _id: string
    name: string
    slug: string
    listingCardImage?: SanityImage
  }[]
  detailVariant?: ProductVariant
  variants: ProductVariant[]
}

export type ConfiguratorConfig = {
  filterDefinitions: AttributeDefinition[]
  tableColumns: AttributeDefinition[]
  defaultVisibleColumns: AttributeDefinition[]
  defaultPageSize: number
  enableSkuSearch?: boolean
  enableStockOnlyToggle?: boolean
}

export type ConfiguratorData = {
  product: ProductDetail | null
  config: ConfiguratorConfig
  options: AttributeOption[]
}

type ListingRawResponse = {
  config: ListingConfig | null
  options?: AttributeOption[]
  products?: ProductCard[]
}

const DEFAULT_LISTING_CONFIG: ListingConfig = {
  defaultSort: 'recommended',
  itemsPerPage: 24,
  tabs: [
    {_key: 'all', label: 'All Products', key: 'all', mode: 'all'},
    {_key: 'inStock', label: 'In Stock', key: 'inStock', mode: 'inStock'},
  ],
  filterDefinitions: [],
  cardAttributeDefinitions: [],
}

const DEFAULT_CONFIGURATOR_CONFIG: ConfiguratorConfig = {
  filterDefinitions: [],
  tableColumns: [],
  defaultVisibleColumns: [],
  defaultPageSize: 20,
  enableSkuSearch: true,
  enableStockOnlyToggle: true,
}

const ATTRIBUTE_VALUE_TYPE_MAP: Record<string, AttributeDefinition['valueType']> = {
  number: 'number',
  boolean: 'boolean',
  text: 'text',
  singleoption: 'singleOption',
  multioption: 'multiOption',
}

function normalizeAttributeValueType(
  rawValue: AttributeDefinition['valueType'] | string | undefined,
): AttributeDefinition['valueType'] {
  const token = valueToToken(rawValue || '')
  return ATTRIBUTE_VALUE_TYPE_MAP[token] ?? 'text'
}

function normalizeUiControl(uiControl: string | undefined) {
  const cleaned = cleanSanityString(uiControl)
  return cleaned ? valueToToken(cleaned) : undefined
}

function normalizeAttributeDefinition(
  definition: AttributeDefinition | undefined,
): AttributeDefinition | undefined {
  if (!definition) {
    return undefined
  }

  return {
    ...definition,
    key: cleanSanityString(definition.key),
    title: definition.title ? cleanSanityString(definition.title) : definition.title,
    valueType: normalizeAttributeValueType(definition.valueType),
    unit: definition.unit ? cleanSanityString(definition.unit) : definition.unit,
    uiControl: normalizeUiControl(definition.uiControl),
  }
}

function normalizeAttributeValue(attribute: AttributeValue): AttributeValue {
  return {
    ...attribute,
    definition: normalizeAttributeDefinition(attribute.definition),
  }
}

function normalizeVariant(variant: ProductVariant): ProductVariant {
  return {
    ...variant,
    configSelections: (variant.configSelections ?? []).map(normalizeAttributeValue),
    specAttributes: (variant.specAttributes ?? []).map(normalizeAttributeValue),
  }
}

function normalizeProductCard(product: ProductCard): ProductCard {
  return {
    ...product,
    variants: (product.variants ?? []).map(normalizeVariant),
  }
}

function normalizeProductDetail(product: ProductDetail): ProductDetail {
  return {
    ...product,
    overview: product.overview
      ? {
          ...product.overview,
          slides: (product.overview.slides ?? []).map((slide) => ({
            ...slide,
            hotspots: (slide.hotspots ?? []).filter(
              (hotspot) =>
                hotspot.product &&
                Boolean(hotspot.product.slug) &&
                Number.isFinite(hotspot.x) &&
                Number.isFinite(hotspot.y),
            ),
          })),
          highlights: product.overview.highlights ?? [],
          splitFeature: product.overview.splitFeature
            ? {
                ...product.overview.splitFeature,
                images: product.overview.splitFeature.images ?? [],
              }
            : undefined,
        }
      : undefined,
    detailVariant: product.detailVariant ? normalizeVariant(product.detailVariant) : undefined,
    variants: (product.variants ?? []).map(normalizeVariant),
    productAttributes: (product.productAttributes ?? []).map(normalizeAttributeValue),
  }
}

const LISTING_QUERY = `{
  "config": *[_type == "listingPageConfig"][0]{
    defaultSort,
    itemsPerPage,
    tabs,
    "filterDefinitions": filterDefinitions[]->{_id, key, title, valueType, uiControl, unit},
    "cardAttributeDefinitions": cardAttributeDefinitions[]->{_id, key, title, valueType, uiControl, unit}
  },
  "options": *[_type == "attributeOption" && coalesce(isDisabled, false) != true] | order(order asc, label asc) {
    _id,
    label,
    value,
    order,
    swatchHex,
    swatchImage,
    "definitionRef": definition._ref
  },
  "products": *[_type == "product" && status == "active"] | order(coalesce(sortPriority, 9999) asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    isNew,
    isInStock,
    listingBadgeText,
    sortPriority,
    listingCardImage,
    "category": category->title,
    "family": family->title,
    "variants": *[_type == "productVariant" && references(^._id) && status == "active"] | order(coalesce(tableSortOrder, 9999) asc, sku asc) {
      _id,
      sku,
      status,
      isStocked,
      stockLabel,
      tableSortOrder,
      configSelections[]{
        definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
        numberValue,
        "numberTextValue": select(defined(numberValue) => string(numberValue), null),
        booleanValue,
        textValue,
        singleOptionValue->{_id, label, value},
        multiOptionValues[]->{_id, label, value}
      },
      specAttributes[]{
        definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
        numberValue,
        "numberTextValue": select(defined(numberValue) => string(numberValue), null),
        booleanValue,
        textValue,
        singleOptionValue->{_id, label, value},
        multiOptionValues[]->{_id, label, value}
      }
    }
  }
}`

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug && status == "active"][0]{
  _id,
  name,
  "slug": slug.current,
  shortDescription,
  heroDescription,
  listingBadgeText,
  "brand": brand->title,
  "category": category->title,
  "family": family->title,
  heroMedia[]{_key, type, image, externalImageUrl, videoUrl},
  overview{
    heading,
    description,
    slides[]{
      "key": _key,
      image,
      "alt": image.alt,
      hotspots[]{
        "key": _key,
        x,
        y,
        "product": select(
          product->status == "active" => product->{
            _id,
            name,
            "slug": slug.current,
            shortDescription,
            listingBadgeText
          },
          null
        )
      }
    },
    highlights[]{"key": _key, title, description, icon},
    splitFeature{
      heading,
      description,
      images[]{"key": _key, "image": @, "alt": alt}
    }
  },
  productAttributes[]{
    definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
    numberValue,
    "numberTextValue": select(defined(numberValue) => string(numberValue), null),
    booleanValue,
    textValue,
    singleOptionValue->{_id, label, value},
    multiOptionValues[]->{_id, label, value}
  },
  resources[]->{
    _id,
    title,
    type,
    externalUrl,
    "fileUrl": coalesce(externalUrl, file.asset->url),
    "fileByteSize": file.asset->size
  },
  featureBlocks[]{
    _key,
    title,
    description,
    alignment,
    media{type, image, externalImageUrl, videoUrl}
  },
  iconHighlights[]{
    _key,
    title,
    description,
    icon
  },
  perfectFor[]->{
    _id,
    title,
    description,
    image
  },
  relatedProducts[]->{
    _id,
    name,
    "slug": slug.current,
    listingCardImage,
    listingBadgeText
  },
  "availableModels": *[_type == "product" && family._ref == ^.family._ref && status == "active"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    listingCardImage
  },
  "detailVariant": detailVariant->{
    _id,
    sku,
    status,
    isStocked,
    stockLabel,
    tableSortOrder,
    previewMedia[]{_key, type, image, externalImageUrl, videoUrl},
    configSelections[]{
      definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
      numberValue,
      "numberTextValue": select(defined(numberValue) => string(numberValue), null),
      booleanValue,
      textValue,
      singleOptionValue->{_id, label, value},
      multiOptionValues[]->{_id, label, value}
    },
    specAttributes[]{
      definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
      numberValue,
      "numberTextValue": select(defined(numberValue) => string(numberValue), null),
      booleanValue,
      textValue,
      singleOptionValue->{_id, label, value},
      multiOptionValues[]->{_id, label, value}
    },
    downloads[]->{
      _id,
      title,
      type,
      externalUrl,
      "fileUrl": coalesce(externalUrl, file.asset->url),
      "fileByteSize": file.asset->size
    }
  },
  "variants": *[_type == "productVariant" && references(^._id) && status == "active"] | order(coalesce(tableSortOrder, 9999) asc, sku asc) {
    _id,
    sku,
    status,
    isStocked,
    stockLabel,
    tableSortOrder,
    previewMedia[]{_key, type, image, externalImageUrl, videoUrl},
    configSelections[]{
      definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
      numberValue,
      "numberTextValue": select(defined(numberValue) => string(numberValue), null),
      booleanValue,
      textValue,
      singleOptionValue->{_id, label, value},
      multiOptionValues[]->{_id, label, value}
    },
    specAttributes[]{
      definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
      numberValue,
      "numberTextValue": select(defined(numberValue) => string(numberValue), null),
      booleanValue,
      textValue,
      singleOptionValue->{_id, label, value},
      multiOptionValues[]->{_id, label, value}
    },
    downloads[]->{
      _id,
      title,
      type,
      externalUrl,
      "fileUrl": coalesce(externalUrl, file.asset->url),
      "fileByteSize": file.asset->size
    }
  }
}`

const CONFIGURATOR_QUERY = `{
  "product": *[_type == "product" && slug.current == $slug && status == "active"][0]{
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    listingBadgeText,
    heroDescription,
    "brand": brand->title,
    "category": category->title,
    "family": family->title,
    heroMedia[]{_key, type, image, externalImageUrl, videoUrl},
    resources[]->{
      _id,
      title,
      type,
      externalUrl,
      "fileUrl": coalesce(externalUrl, file.asset->url),
      "fileByteSize": file.asset->size
    },
    "availableModels": *[_type == "product" && family._ref == ^.family._ref && status == "active"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      listingCardImage
    },
    "variants": *[_type == "productVariant" && references(^._id) && status == "active"] | order(coalesce(tableSortOrder, 9999) asc, sku asc) {
      _id,
      sku,
      status,
      isStocked,
      stockLabel,
      tableSortOrder,
      previewMedia[]{_key, type, image, externalImageUrl, videoUrl},
      configSelections[]{
        definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
        numberValue,
        "numberTextValue": select(defined(numberValue) => string(numberValue), null),
        booleanValue,
        textValue,
        singleOptionValue->{_id, label, value},
        multiOptionValues[]->{_id, label, value}
      },
      specAttributes[]{
        definition->{_id, key, title, valueType, unit, displayGroup, displayOrder},
        numberValue,
        "numberTextValue": select(defined(numberValue) => string(numberValue), null),
        booleanValue,
        textValue,
        singleOptionValue->{_id, label, value},
        multiOptionValues[]->{_id, label, value}
      },
      downloads[]->{
        _id,
        title,
        type,
        externalUrl,
        "fileUrl": coalesce(externalUrl, file.asset->url),
        "fileByteSize": file.asset->size
      }
    }
  },
  "config": *[_type == "configuratorPageConfig"][0]{
    "filterDefinitions": filterDefinitions[]->{_id, key, title, valueType, uiControl, unit},
    "tableColumns": tableColumns[]->{_id, key, title, valueType, uiControl, unit, displayGroup, displayOrder},
    "defaultVisibleColumns": defaultVisibleColumns[]->{_id, key, title, valueType, uiControl, unit},
    defaultPageSize,
    enableSkuSearch,
    enableStockOnlyToggle
  },
  "options": *[_type == "attributeOption" && coalesce(isDisabled, false) != true] | order(order asc, label asc) {
    _id,
    label,
    value,
    order,
    swatchHex,
    swatchImage,
    "definitionRef": definition._ref
  }
}`

export async function getListingData() {
  const result = await fetchSanity<ListingRawResponse | null>(LISTING_QUERY)
  const config = result?.config ?? DEFAULT_LISTING_CONFIG
  const normalizedFilterDefinitions = (config.filterDefinitions ?? [])
    .map(normalizeAttributeDefinition)
    .filter((definition): definition is AttributeDefinition => Boolean(definition?.key))
  const normalizedCardDefinitions = (config.cardAttributeDefinitions ?? [])
    .map(normalizeAttributeDefinition)
    .filter((definition): definition is AttributeDefinition => Boolean(definition?.key))

  return {
    config: {
      ...DEFAULT_LISTING_CONFIG,
      ...config,
      filterDefinitions: normalizedFilterDefinitions,
      cardAttributeDefinitions: normalizedCardDefinitions,
      tabs: config.tabs ?? DEFAULT_LISTING_CONFIG.tabs,
    },
    options: result?.options ?? [],
    products: (result?.products ?? []).map(normalizeProductCard),
  }
}

export async function getProductBySlug(slug: string) {
  const product = await fetchSanity<ProductDetail | null>(PRODUCT_QUERY, {slug})
  return product ? normalizeProductDetail(product) : null
}

export async function getConfiguratorBySlug(slug: string) {
  const result = await fetchSanity<ConfiguratorData | null>(CONFIGURATOR_QUERY, {slug})
  const config = result?.config ?? DEFAULT_CONFIGURATOR_CONFIG
  const product = result?.product ? normalizeProductDetail(result.product) : null
  const normalizedFilterDefinitions = (config.filterDefinitions ?? [])
    .map(normalizeAttributeDefinition)
    .filter((definition): definition is AttributeDefinition => Boolean(definition?.key))
  const normalizedTableColumns = (config.tableColumns ?? [])
    .map(normalizeAttributeDefinition)
    .filter((definition): definition is AttributeDefinition => Boolean(definition?.key))
  const normalizedVisibleColumns = (config.defaultVisibleColumns ?? [])
    .map(normalizeAttributeDefinition)
    .filter((definition): definition is AttributeDefinition => Boolean(definition?.key))
  const usedOptionIds = new Set(
    (product?.variants ?? []).flatMap((variant) =>
      [...variant.configSelections, ...variant.specAttributes].flatMap((attribute) => [
        ...(attribute.singleOptionValue ? [attribute.singleOptionValue._id] : []),
        ...(attribute.multiOptionValues ?? []).map((option) => option._id),
      ]),
    ),
  )

  return {
    product,
    config: {
      filterDefinitions: normalizedFilterDefinitions,
      tableColumns: normalizedTableColumns,
      defaultVisibleColumns: normalizedVisibleColumns,
      defaultPageSize: config.defaultPageSize ?? DEFAULT_CONFIGURATOR_CONFIG.defaultPageSize,
      enableSkuSearch: config.enableSkuSearch ?? DEFAULT_CONFIGURATOR_CONFIG.enableSkuSearch,
      enableStockOnlyToggle:
        config.enableStockOnlyToggle ?? DEFAULT_CONFIGURATOR_CONFIG.enableStockOnlyToggle,
    },
    options: (result?.options ?? []).filter((option) => usedOptionIds.has(option._id)),
  }
}

export function attributeValueToLabel(attribute: AttributeValue | undefined) {
  if (!attribute) {
    return null
  }

  if (attribute.singleOptionValue) {
    return attribute.singleOptionValue.label
  }

  if (attribute.multiOptionValues && attribute.multiOptionValues.length > 0) {
    return attribute.multiOptionValues.map((item) => item.label).join(', ')
  }

  if (typeof attribute.textValue === 'string' && attribute.textValue.length > 0) {
    return attribute.textValue
  }

  if (typeof attribute.numberValue === 'number') {
    const unit = attribute.definition?.unit ? ` ${attribute.definition.unit}` : ''
    return `${attribute.numberTextValue ?? String(attribute.numberValue)}${unit}`
  }

  if (typeof attribute.booleanValue === 'boolean') {
    return attribute.booleanValue ? 'Yes' : 'No'
  }

  return null
}

export function attributeValueToTokens(attribute: AttributeValue | undefined) {
  if (!attribute) {
    return []
  }

  if (attribute.singleOptionValue) {
    return [valueToToken(attribute.singleOptionValue.value || attribute.singleOptionValue.label)]
  }

  if (attribute.multiOptionValues && attribute.multiOptionValues.length > 0) {
    return attribute.multiOptionValues.map((item) => valueToToken(item.value || item.label))
  }

  if (typeof attribute.textValue === 'string' && attribute.textValue.length > 0) {
    return [valueToToken(attribute.textValue)]
  }

  if (typeof attribute.numberValue === 'number') {
    return [String(attribute.numberValue)]
  }

  if (typeof attribute.booleanValue === 'boolean') {
    return [attribute.booleanValue ? 'true' : 'false']
  }

  return []
}

export function pickAttribute(values: AttributeValue[] | undefined, key: string) {
  if (!values) {
    return undefined
  }

  const cleanedKey = cleanSanityString(key)
  return values.find((item) => cleanSanityString(item.definition?.key) === cleanedKey)
}

export function filterVariantsBySelections(
  variants: ProductVariant[],
  selectedFilters: Record<string, string[]>,
  stockedOnly = false,
  query = '',
) {
  const skuQuery = valueToToken(query)
  const numericRangePattern = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/

  return variants.filter((variant) => {
    if (stockedOnly && !variant.isStocked) {
      return false
    }

    if (skuQuery && !valueToToken(variant.sku).includes(skuQuery)) {
      return false
    }

    return Object.entries(selectedFilters).every(([key, selectedTokens]) => {
      if (selectedTokens.length === 0) {
        return true
      }

      const attribute =
        pickAttribute(variant.configSelections, key) || pickAttribute(variant.specAttributes, key)
      if (!attribute) {
        return false
      }

      if (
        normalizeAttributeValueType(attribute.definition?.valueType) === 'number' &&
        selectedTokens.length === 1 &&
        typeof attribute.numberValue === 'number'
      ) {
        const rangeMatch = selectedTokens[0].match(numericRangePattern)
        if (rangeMatch) {
          const min = Number(rangeMatch[1])
          const max = Number(rangeMatch[2])
          if (!Number.isNaN(min) && !Number.isNaN(max)) {
            return attribute.numberValue >= min && attribute.numberValue <= max
          }
        }
      }

      const tokens = attributeValueToTokens(attribute)
      return selectedTokens.some((token) => tokens.includes(token))
    })
  })
}

export function groupSpecsByDisplayGroup(values: AttributeValue[] | undefined) {
  const grouped = new Map<string, {label: string; value: string}[]>()

  const sorted = [...(values ?? [])].sort((a, b) => {
    const ao = a.definition?.displayOrder ?? 999
    const bo = b.definition?.displayOrder ?? 999
    return ao - bo
  })

  sorted.forEach((attribute) => {
    const label = attribute.definition?.title
    const value = attributeValueToLabel(attribute)

    if (!label || !value) {
      return
    }

    const group = attribute.definition?.displayGroup || 'General'
    const existing = grouped.get(group) ?? []
    existing.push({label, value})
    grouped.set(group, existing)
  })

  return Array.from(grouped.entries()).map(([group, items]) => ({group, items}))
}

export function parseMultiParam(
  rawParam: string | string[] | undefined | null,
  fallback: string[] = [],
): string[] {
  if (!rawParam) {
    return fallback
  }

  if (Array.isArray(rawParam)) {
    return rawParam.flatMap((item) =>
      item
        .split(',')
        .map((token) => valueToToken(token))
        .filter(Boolean),
    )
  }

  return rawParam
    .split(',')
    .map((token) => valueToToken(token))
    .filter(Boolean)
}
