import {redirect} from 'next/navigation'

type SearchParams = Record<string, string | string[] | undefined>

export default async function VariantDetailRouteRedirect({
  params,
  searchParams,
}: {
  params: Promise<{slug: string; sku: string}>
  searchParams: Promise<SearchParams>
}) {
  const [{slug, sku}, rawSearch] = await Promise.all([params, searchParams])

  const nextParams = new URLSearchParams()

  Object.entries(rawSearch).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => nextParams.append(key, item))
      return
    }

    if (typeof value === 'string' && value.length > 0) {
      nextParams.set(key, value)
    }
  })

  nextParams.set('skuId', decodeURIComponent(sku))

  redirect(`/configurator/product/${slug}?${nextParams.toString()}`)
}
