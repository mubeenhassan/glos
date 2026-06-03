import {type AttributeValue} from '@/lib/catalog'
import {valueToToken} from '@/lib/sanity'

export type SpecDisplayEntry = {
  label: string
  showSwatch: boolean
}

function shouldShowSwatch(definitionKey: string | undefined) {
  const key = valueToToken(definitionKey || '')
  return (
    key.includes('finish') ||
    key.includes('colour') ||
    key.includes('color') ||
    key.includes('cri') ||
    key.includes('temperature')
  )
}

export function specSwatchColor(label: string) {
  const token = valueToToken(label)

  if (token.includes('2700')) return '#e8954f'
  if (token.includes('3000')) return '#e8c84a'
  if (token.includes('4000')) return '#f0e6b8'
  if (token.includes('black')) return '#1d1e22'
  if (token.includes('white')) return '#f3f3f3'
  if (token.includes('grey') || token.includes('gray')) return '#b8bac0'
  if (token.includes('gold')) return '#b58b4d'
  if (token.includes('aluminium') || token.includes('aluminum')) return '#c8cacf'
  if (token.includes('bronze')) return '#7f6550'
  if (token.includes('silver')) return '#c5c9d1'
  if (token.includes('metallic')) return '#9aa0a8'

  return '#2f3440'
}

export function getSpecDisplayEntries(
  attribute: AttributeValue,
): SpecDisplayEntry[] {
  const showSwatch = shouldShowSwatch(attribute.definition?.key)

  if (attribute.multiOptionValues && attribute.multiOptionValues.length > 0) {
    return attribute.multiOptionValues.map((item) => ({
      label: item.label,
      showSwatch,
    }))
  }

  if (attribute.singleOptionValue) {
    return [
      {
        label: attribute.singleOptionValue.label,
        showSwatch,
      },
    ]
  }

  if (typeof attribute.numberValue === 'number') {
    const unit = attribute.definition?.unit
      ? ` ${attribute.definition.unit}`
      : ''
    const formatted =
      attribute.numberTextValue ?? String(attribute.numberValue)
    return [{label: `${formatted}${unit}`, showSwatch}]
  }

  if (typeof attribute.textValue === 'string' && attribute.textValue.length > 0) {
    const parts = attribute.textValue
      .split(/,|\n/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length > 1) {
      return parts.map((part) => ({label: part, showSwatch: false}))
    }

    return [{label: attribute.textValue.trim(), showSwatch}]
  }

  if (typeof attribute.booleanValue === 'boolean') {
    return [{label: attribute.booleanValue ? 'Yes' : 'No', showSwatch: false}]
  }

  return []
}

export function sortSpecAttributes(attributes: AttributeValue[]) {
  return [...attributes].sort((a, b) => {
    const ao = a.definition?.displayOrder ?? 999
    const bo = b.definition?.displayOrder ?? 999
    return ao - bo
  })
}
