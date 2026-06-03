import {
  attributeValueToLabel,
  groupSpecsByDisplayGroup,
  pickAttribute,
  type ProductVariant,
} from '@/lib/catalog'
import {valueToToken} from '@/lib/sanity'

export type SkuKeyInfoItem = {
  key: 'power' | 'finish' | 'colour' | 'beam'
  label: string
}

export type SkuSpecRow = {
  label: string
  value: string
}

export type SkuDetailPayload = {
  sku: string
  keyInfoItems: SkuKeyInfoItem[]
  designRows: SkuSpecRow[]
  performanceRows: SkuSpecRow[]
  driverRows: SkuSpecRow[]
  installationRows: SkuSpecRow[]
  colourSwatch: string
}

function getVariantAttributeValue(variant: ProductVariant, keys: string[]) {
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

function getGroupRows(
  groups: ReturnType<typeof groupSpecsByDisplayGroup>,
  matchers: string[],
) {
  const loweredMatchers = matchers.map((item) => valueToToken(item))
  const selected = groups.filter((group) =>
    loweredMatchers.some((matcher) => valueToToken(group.group).includes(matcher)),
  )

  const seen = new Set<string>()
  const rows: SkuSpecRow[] = []
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

function colourSwatchForLabel(colourTempValue: string | undefined) {
  if (colourTempValue?.includes('2700')) return '#f69a18'
  if (colourTempValue?.includes('3000')) return '#f2b625'
  if (colourTempValue?.includes('4000')) return '#ebd56d'
  return '#cfd2d9'
}

export function buildSkuDetailPayload(
  variant: ProductVariant | undefined,
): SkuDetailPayload | null {
  if (!variant) {
    return null
  }

  const specGroups = groupSpecsByDisplayGroup(variant.specAttributes)
  const powerValue = getVariantAttributeValue(variant, ['wattage', 'power'])
  const finishValue = getVariantAttributeValue(variant, ['finish', 'material'])
  const colourTempValue = getVariantAttributeValue(variant, ['colourTemperature'])
  const beamAngleValue = getVariantAttributeValue(variant, ['beamAngle'])

  const keyInfoItems = [
    powerValue ? {key: 'power' as const, label: powerValue} : null,
    finishValue ? {key: 'finish' as const, label: finishValue} : null,
    colourTempValue ? {key: 'colour' as const, label: colourTempValue} : null,
    beamAngleValue ? {key: 'beam' as const, label: beamAngleValue} : null,
  ].filter((item): item is SkuKeyInfoItem => Boolean(item))

  return {
    sku: variant.sku,
    keyInfoItems,
    designRows: getGroupRows(specGroups, ['design']),
    performanceRows: getGroupRows(specGroups, ['performance']),
    driverRows: getGroupRows(specGroups, ['driver']),
    installationRows: getGroupRows(specGroups, ['installation']),
    colourSwatch: colourSwatchForLabel(colourTempValue),
  }
}
