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
  linkType?: 'internal' | 'external'
  internalLink?: CmsInternalLink | null
  externalUrl?: string
  openInNewTab?: boolean
  variant?: 'primary' | 'secondary' | 'dark' | 'light' | 'outline'
}

export type CmsNavigationChild = {
  _key?: string
  label?: string
  linkType?: 'internal' | 'external'
  internalLink?: CmsInternalLink | null
  externalUrl?: string
  openInNewTab?: boolean
}

export type CmsNavigationItem = {
  _key?: string
  label?: string
  linkType?: 'internal' | 'external'
  internalLink?: CmsInternalLink | null
  externalUrl?: string
  openInNewTab?: boolean
  children?: CmsNavigationChild[]
}

export type CmsImage = SanityImage & {
  alt?: string
}

export type CmsHeroBlock = {
  _key?: string
  _type: 'heroBlock'
  eyebrow?: string
  title?: string
  description?: string
  mainImage?: CmsImage
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
  footerColumns?: CmsNavigationItem[]
  footerText?: string
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
  externalUrl,
  openInNewTab,
  "internalLink": internalLink->{
    _type,
    title,
    "slug": slug.current
  },
  "children": children[]{
    _key,
    label,
    linkType,
    externalUrl,
    openInNewTab,
    "internalLink": internalLink->{
      _type,
      title,
      "slug": slug.current
    }
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
      eyebrow,
      title,
      description,
      mainImage,
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
  "footerColumns": footerColumns[]{${NAV_ITEM_QUERY_FIELDS}},
  footerText,
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
  item: Pick<CmsNavigationItem, 'linkType' | 'internalLink' | 'externalUrl' | 'openInNewTab'>,
) {
  if (item.linkType === 'internal') {
    return {
      href: resolveInternalHref(item.internalLink),
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
