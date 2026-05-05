import 'server-only'
import {fetchSanity, type SanityImage} from '@/lib/sanity'

export type CmsInternalLink = {
  _type?: 'page' | 'product'
  title?: string
  slug?: string
}

export type CmsButton = {
  _key?: string
  text?: string
  linkType?: 'internal' | 'path' | 'external'
  internalLink?: CmsInternalLink | null
  internalPath?: string
  externalUrl?: string
  openInNewTab?: boolean
  variant?: 'primary' | 'secondary' | 'dark' | 'light' | 'outline'
}

export type CmsNavigationItem = {
  _key?: string
  label?: string
  linkType?: 'internal' | 'path' | 'external'
  internalLink?: CmsInternalLink | null
  internalPath?: string
  externalUrl?: string
  openInNewTab?: boolean
}

export type CmsImage = SanityImage & {
  alt?: string
}

export type CmsMediaItem = {
  _type?: 'mediaItem'
  type?: 'image' | 'video'
  image?: CmsImage
  externalImageUrl?: string
  videoUrl?: string
}

export type CmsFooterLinkColumn = {
  _key?: string
  title?: string
  titleLinkType?: 'none' | 'internal' | 'path' | 'external'
  titleInternalLink?: CmsInternalLink | null
  titlePath?: string
  titleExternalUrl?: string
  titleOpenInNewTab?: boolean
  links?: CmsNavigationItem[]
}

export type CmsHeroBlock = {
  _key?: string
  _type: 'heroBlock'
  title?: string
  description?: string
  contentAlignment?: 'left' | 'center' | 'right'
  backgroundMedia?: CmsMediaItem
  overlayOpacity?: number
  cta?: CmsButton[]
}

export type CmsContentImageCtaBlock = {
  _key?: string
  _type: 'contentImageCta'
  title?: string
  description?: string
  imagePosition?: 'left' | 'right'
  mainImage?: CmsImage
  cta?: CmsButton[]
}

export type CmsContentBlock = CmsHeroBlock | CmsContentImageCtaBlock

export type CmsSeo = {
  metaTitle?: string
  metaDescription?: string
  openGraphImage?: CmsImage
  noIndex?: boolean
}

export type CmsPage = {
  _id?: string
  title?: string
  slug?: string
  contentBlocks?: CmsContentBlock[]
  seo?: CmsSeo
}

type NotFoundSettings = {
  errorCode?: string
  heading?: string
  description?: string
  cta?: CmsButton[]
}

export type SiteSettings = {
  title?: string
  description?: string
  logo?: CmsImage
  footerLogo?: CmsImage
  headerNavigation?: CmsNavigationItem[]
  showHeaderSearch?: boolean
  headerSearchUrl?: string
  footerDescription?: string
  footerLinkColumns?: CmsFooterLinkColumn[]
  footerContactTitle?: string
  footerContactAddress?: string
  footerContactPhone?: string
  footerContactEmail?: string
  footerCopyright?: string
  footerLegalLinks?: CmsNavigationItem[]
  socialLinks?: {
    _key?: string
    platform?: string
    url?: string
  }[]
  globalSeo?: CmsSeo
  notFoundPage?: NotFoundSettings
}

type ResolvedHref = {
  href: string | null
  openInNewTab: boolean
  isExternal: boolean
}

const BUTTON_QUERY_FIELDS = `
  _key,
  text,
  linkType,
  internalPath,
  openInNewTab,
  variant,
  externalUrl,
  "internalLink": internalLink->{
    _type,
    title,
    "slug": slug.current
  }
`

const NAV_ITEM_QUERY_FIELDS = `
  _key,
  label,
  linkType,
  internalPath,
  externalUrl,
  openInNewTab,
  "internalLink": internalLink->{
    _type,
    title,
    "slug": slug.current
  }
`

const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  contentBlocks[]{
    _type,
    _key,
    _type == "heroBlock" => {
      title,
      description,
      contentAlignment,
      backgroundMedia{
        _type,
        type,
        image,
        externalImageUrl,
        videoUrl
      },
      overlayOpacity,
      cta[]{${BUTTON_QUERY_FIELDS}}
    },
    _type == "contentImageCta" => {
      title,
      description,
      imagePosition,
      mainImage,
      cta[]{${BUTTON_QUERY_FIELDS}}
    }
  },
  seo{
    metaTitle,
    metaDescription,
    openGraphImage,
    noIndex
  }
}`

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  title,
  description,
  logo,
  footerLogo,
  "headerNavigation": headerNavigation[]{${NAV_ITEM_QUERY_FIELDS}},
  showHeaderSearch,
  headerSearchUrl,
  footerDescription,
  "footerLinkColumns": footerLinkColumns[]{
    _key,
    title,
    titleLinkType,
    titlePath,
    titleExternalUrl,
    titleOpenInNewTab,
    "titleInternalLink": titleInternalLink->{
      _type,
      title,
      "slug": slug.current
    },
    "links": links[]{${NAV_ITEM_QUERY_FIELDS}}
  },
  footerContactTitle,
  footerContactAddress,
  footerContactPhone,
  footerContactEmail,
  footerCopyright,
  "footerLegalLinks": footerLegalLinks[]{${NAV_ITEM_QUERY_FIELDS}},
  socialLinks[]{
    _key,
    platform,
    url
  },
  globalSeo{
    metaTitle,
    metaDescription,
    openGraphImage,
    noIndex
  },
  notFoundPage{
    errorCode,
    heading,
    description,
    "cta": cta[]{${BUTTON_QUERY_FIELDS}}
  }
}`

export async function getPageBySlug(slug: string) {
  return fetchSanity<CmsPage | null>(PAGE_QUERY, {slug})
}

export async function getSiteSettings() {
  return fetchSanity<SiteSettings | null>(SITE_SETTINGS_QUERY)
}

export function resolveInternalHref(link: CmsInternalLink | null | undefined) {
  if (!link?._type || !link.slug) {
    return null
  }

  if (link._type === 'page') {
    return link.slug === 'home' ? '/' : `/${link.slug}`
  }

  if (link._type === 'product') {
    return `/products/${link.slug}`
  }

  return null
}

export function resolveButtonHref(button: CmsButton | null | undefined): ResolvedHref {
  if (!button) {
    return {href: null, openInNewTab: false, isExternal: false}
  }

  if (button.linkType === 'internal') {
    return {
      href: resolveInternalHref(button.internalLink),
      openInNewTab: Boolean(button.openInNewTab),
      isExternal: false,
    }
  }

  if (button.linkType === 'path') {
    return {
      href: button.internalPath || null,
      openInNewTab: false,
      isExternal: false,
    }
  }

  if (button.linkType === 'external') {
    return {
      href: button.externalUrl || null,
      openInNewTab: Boolean(button.openInNewTab),
      isExternal: true,
    }
  }

  return {href: null, openInNewTab: false, isExternal: false}
}

export function resolveNavigationHref(
  item: Pick<CmsNavigationItem, 'linkType' | 'internalLink' | 'internalPath' | 'externalUrl' | 'openInNewTab'>,
) {
  if (item.linkType === 'internal') {
    return {
      href: resolveInternalHref(item.internalLink),
      openInNewTab: false,
      isExternal: false,
    }
  }

  if (item.linkType === 'path') {
    return {
      href: item.internalPath || null,
      openInNewTab: false,
      isExternal: false,
    }
  }

  return {
    href: item.externalUrl || null,
    openInNewTab: Boolean(item.openInNewTab),
    isExternal: true,
  }
}
