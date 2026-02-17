import 'server-only'
import {createClient} from '@sanity/client'
import {stegaClean} from '@sanity/client/stega'
import {draftMode} from 'next/headers'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'v5u3xa8m'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'glos'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01'
const readToken = process.env.SANITY_API_READ_TOKEN
const useCdn = process.env.NEXT_PUBLIC_SANITY_USE_CDN === 'true'
const studioUrl =
  process.env.SANITY_STUDIO_URL ?? process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? 'http://localhost:3333'
type SanityPerspective = 'published' | 'previewDrafts'

type SanityFetchOptions = {
  perspective?: SanityPerspective
  revalidate?: number
}

const stegaExcludedFieldNames = new Set(['sku', 'value'])

export type SanityImage = {
  _type?: 'image'
  asset?: {
    _ref?: string
  }
}

export type MediaItemLike = {
  image?: SanityImage
  externalImageUrl?: string
}

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: SanityFetchOptions = {},
) {
  const {isEnabled: isDraftModeEnabled} = await draftMode()
  const requestedPerspective = options.perspective ?? (isDraftModeEnabled ? 'previewDrafts' : 'published')
  const perspective = requestedPerspective === 'previewDrafts' && readToken ? 'previewDrafts' : 'published'
  const enableStega = perspective === 'previewDrafts'

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: perspective === 'published' && useCdn,
    perspective,
    token: perspective === 'previewDrafts' ? readToken : undefined,
    stega: {
      enabled: enableStega,
      studioUrl,
      filter: (props) => {
        const segment = props.sourcePath.at(-1)
        if (typeof segment === 'string' && stegaExcludedFieldNames.has(segment)) {
          return false
        }
        return props.filterDefault(props)
      },
    },
  })

  if (perspective === 'previewDrafts') {
    return client.fetch<T>(query, params, {
      cache: 'no-store',
    })
  }

  return client.fetch<T>(query, params, {
    next: {revalidate: options.revalidate ?? 60},
  })
}

export function sanityImageUrl(image: SanityImage | null | undefined, width = 1200) {
  const ref = image?.asset?._ref
  if (!ref || !ref.startsWith('image-')) {
    return null
  }

  const parts = ref.split('-')
  if (parts.length < 4) {
    return null
  }

  const id = parts[1]
  const dimensions = parts[2]
  const format = parts[3]

  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=${width}&auto=format`
}

export function mediaImageUrl(media: MediaItemLike | null | undefined, width = 1200) {
  if (!media) {
    return null
  }

  if (media.externalImageUrl) {
    return media.externalImageUrl
  }

  return sanityImageUrl(media.image, width)
}

export function valueToToken(value: string) {
  return stegaClean(value).trim().toLowerCase()
}
