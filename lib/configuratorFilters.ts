import {type AttributeDefinition} from '@/lib/catalog'
import {parseMultiParam} from '@/lib/catalog'
import {valueToToken} from '@/lib/sanity'

export type SearchParams = Record<string, string | string[] | undefined>

export function toSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function asSearchParamsObject(raw: SearchParams) {
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

export function toggleFilter(
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

export function configuratorHref(slug: string, query: string) {
  return query ? `/configurator/product/${slug}?${query}` : `/configurator/product/${slug}`
}

export function normalizeFilterKey(value: string | undefined) {
  return valueToToken((value || '').replace(/[^a-zA-Z0-9]/g, ''))
}
