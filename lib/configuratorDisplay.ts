import {type AttributeDefinition} from '@/lib/catalog'
import {valueToToken} from '@/lib/sanity'
import {normalizeFilterKey} from '@/lib/configuratorFilters'

export type ConfiguratorFilterLayout =
  | 'range'
  | 'swatch'
  | 'colour'
  | 'model'
  | 'accessory'
  | 'chips'

export function finishSwatchColor(label: string) {
  const token = valueToToken(label)
  if (token.includes('black')) return '#1d1e22'
  if (token.includes('white')) return '#f3f3f3'
  if (token.includes('grey') || token.includes('gray')) return '#b8bac0'
  if (token.includes('silver')) return '#c8cacf'
  if (token.includes('gold')) return '#b58b4d'
  if (token.includes('bronze')) return '#7f6550'
  if (token.includes('aluminium') || token.includes('aluminum')) return '#c8cacf'
  return '#cfd2d8'
}

export function colourTemperatureSwatchColor(label: string) {
  const token = valueToToken(label)
  if (token.includes('2700')) return '#f69a18'
  if (token.includes('3000')) return '#f2b625'
  if (token.includes('4000')) return '#ebd56d'
  if (token.includes('5000')) return '#e8f1ff'
  if (token.includes('6000')) return '#dbeafe'
  return '#e5e7eb'
}

export function getConfiguratorFilterLayout(
  definition: AttributeDefinition,
): ConfiguratorFilterLayout {
  const key = normalizeFilterKey(definition.key)
  const title = normalizeFilterKey(definition.title)
  const control = definition.uiControl || 'chips'

  if (definition.valueType === 'number' || control === 'range') {
    return 'range'
  }

  if (control === 'swatch' || key === 'finish' || title === 'finish') {
    return 'swatch'
  }

  if (control === 'model') {
    return 'model'
  }

  if (key === 'colourtemperature' || title === 'colourtemperature') {
    return 'colour'
  }

  if (key === 'model' || title === 'model') {
    return 'model'
  }

  if (key === 'opticaccessory' || title === 'opticaccessory') {
    return 'accessory'
  }

  return 'chips'
}

export function getConfiguratorChipGridClass(definition: AttributeDefinition) {
  const key = normalizeFilterKey(definition.key)
  const title = normalizeFilterKey(definition.title)

  if (key.includes('wattage') || title.includes('wattage') || key.includes('beam') || title.includes('beam')) {
    return 'grid-cols-5 max-[700px]:grid-cols-3'
  }

  if (key.includes('control') || title.includes('controlgear') || title.includes('control')) {
    return 'grid-cols-2'
  }

  return 'grid-cols-3 max-[700px]:grid-cols-2'
}

export function splitModelOptionLabel(label: string) {
  const parts = label.split(/\s*[•|–-]\s*/)
  if (parts.length >= 2) {
    return {
      primary: parts[0].trim(),
      secondary: parts.slice(1).join(' ').trim(),
    }
  }

  const dimensionMatch = label.match(/^(.+?)\s+(\d+\s*mm.*)$/i)
  if (dimensionMatch) {
    return {
      primary: dimensionMatch[1].trim(),
      secondary: dimensionMatch[2].trim(),
    }
  }

  const parenMatch = label.match(/^(.+?)\s*(\([^)]+\))$/)
  if (parenMatch) {
    return {
      primary: parenMatch[1].trim(),
      secondary: parenMatch[2].trim(),
    }
  }

  return {
    primary: label,
    secondary: '',
  }
}
