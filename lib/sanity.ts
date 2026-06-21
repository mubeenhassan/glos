import 'server-only'
import {createClient} from '@sanity/client'
import {stegaClean} from '@sanity/client/stega'
import {draftMode} from 'next/headers'

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

const projectId = requireEnv(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = requireEnv(process.env.NEXT_PUBLIC_SANITY_DATASET, 'NEXT_PUBLIC_SANITY_DATASET')
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

// Fields that must never be stega-encoded:
// - enum / option values used in JS comparisons or as CSS/HTML attributes
// - technical identifiers used in routing, filtering, or API lookups
// - computed fields that contain numeric or path data
// Encoding these causes the Visual Editor scanner to find corrupt watermarks
// when the strings are processed (compared, split, used in URLs, etc.)
const stegaExcludedFieldNames = new Set([
  // Already excluded
  'sku',
  'value',

  // Enum / discriminator fields
  'type',
  'status',
  'scope',
  'mode',
  'platform',
  'language',
  'valueType',
  'uiControl',
  'displayGroup',
  'linkType',
  'titleLinkType',
  'contentAlignment',
  'imagePosition',
  'tone',
  'variant',
  'fieldType',
  'embedInputType',
  'defaultSort',

  // Technical identifiers
  'key',
  'name',
  'slug',
  'errorCode',
  'definitionRef',

  // CSS / visual values
  'swatchHex',
  'color',

  // Computed / derived strings
  'numberTextValue',

  // Path / URL fields (filterDefault covers http URLs but not internal paths)
  'internalPath',
  'titlePath',
])

// Path segments whose entire subtree should be excluded from stega.
// Option labels and attribute selections are used in JS comparisons and
// filter logic — encoding them produces corrupt watermarks on any string
// processing (comparison, slice, concatenation, URL encoding, etc.).
const stegaExcludedPathSegments = new Set([
  'singleOptionValue',
  'multiOptionValues',
  'configSelections',
  'specAttributes',
  'productAttributes',
  'options',
  'filterDefinitions',
  'cardAttributeDefinitions',
  'tableColumns',
  'defaultVisibleColumns',
])

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
    token: readToken,
    stega: {
      enabled: enableStega,
      studioUrl,
      filter: (props) => {
        const segment = props.sourcePath.at(-1)

        // Exclude by field name
        if (typeof segment === 'string' && stegaExcludedFieldNames.has(segment)) {
          return false
        }

        // Exclude entire option/selection subtrees — attribute option labels and
        // config-selection values are used in filter logic, not click-to-edit.
        // Encoding short option strings produces watermarks that break on any
        // string processing, causing the 180+ decode errors in the Visual Editor.
        const pathStrings = props.sourcePath.filter((s): s is string => typeof s === 'string')
        if (
          pathStrings.some((s) =>
            stegaExcludedPathSegments.has(s),
          )
        ) {
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

export function cleanSanityString(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return ''
  }

  return stegaClean(value).trim()
}

export function valueToToken(value: string) {
  return cleanSanityString(value).toLowerCase()
}
