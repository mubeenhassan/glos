import 'server-only'
import {fetchSanity, type SanityImage} from '@/lib/sanity'

export type CmsInternalLink = {
  _type?: 'page' | 'product' | 'project'
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

export type CmsImageGalleryBlock = {
  _key?: string
  _type: 'imageGalleryBlock'
  title?: string
  images?: CmsImage[]
}

export type CmsProductSpotlightItem = {
  _key?: string
  hotspotX?: number
  hotspotY?: number
  imageOverride?: CmsImage
  product?: {
    _id?: string
    name?: string
    slug?: string
    shortDescription?: string
    heroDescription?: string
    listingBadgeText?: string
    category?: string
    listingCardImage?: CmsImage
    heroImage?: CmsImage
    heroMedia?: CmsMediaItem
  } | null
}

export type CmsProductSpotlightBlock = {
  _key?: string
  _type: 'productSpotlightBlock'
  title?: string
  items?: CmsProductSpotlightItem[]
}

export type CmsImageCollageCtaBlock = {
  _key?: string
  _type: 'imageCollageCtaBlock'
  title?: string
  eyebrow?: string
  description?: string
  mainImage?: CmsImage
  topImage?: CmsImage
  bottomImage?: CmsImage
  cta?: CmsButton[]
}

export type CmsPinnedProductShowcaseBlock = {
  _key?: string
  _type: 'pinnedProductShowcaseBlock'
  title?: string
  detailTitle?: string
  description?: string
  backgroundImage?: CmsImage
  productImageOverride?: CmsImage
  specItems?: {
    _key?: string
    label?: string
    color?: string
  }[]
  downloadLinks?: {
    _key?: string
    label?: string
    url?: string
  }[]
  cta?: CmsButton[]
  product?: {
    _id?: string
    name?: string
    slug?: string
    shortDescription?: string
    heroDescription?: string
    listingCardImage?: CmsImage
    heroImage?: CmsImage
    heroMedia?: CmsMediaItem
    productAttributes?: {
      definition?: {
        title?: string
        unit?: string
      }
      numberValue?: number
      numberTextValue?: string
      booleanValue?: boolean
      textValue?: string
      singleOptionValue?: {
        label?: string
        value?: string
      }
      multiOptionValues?: {
        label?: string
        value?: string
      }[]
    }[]
    resources?: {
      _id?: string
      title?: string
      type?: string
      url?: string
    }[]
  } | null
}

export type CmsResourcesLearningBlock = {
  _key?: string
  _type: 'resourcesLearningBlock'
  title?: string
  intro?: string
  description?: string
  cta?: CmsButton[]
}

export type CmsFeaturedProjectsBlock = {
  _key?: string
  _type: 'featuredProjectsBlock'
  title?: string
  projects?: {
    _id?: string
    title?: string
    slug?: string
    description?: string
    location?: string
    projectType?: string
    completionYear?: number
    coverImage?: CmsImage
  }[]
  cta?: CmsButton[]
}

export type CmsProjectsListingBlock = {
  _key?: string
  _type: 'projectsListingBlock'
  title?: string
  description?: string
  showAllFilter?: boolean
  allFilterLabel?: string
  categories?: {
    _key?: string
    value?: string
    label?: string
  }[]
  maxItems?: number
}

export type CmsStatTile = {
  _key?: string
  value?: string
  label?: string
}

export type CmsStatsBlock = {
  _key?: string
  _type: 'statsBlock'
  heading?: string
  stats?: CmsStatTile[]
}

export type CmsCtaBannerBlock = {
  _key?: string
  _type: 'ctaBannerBlock'
  heading?: string
  description?: string
  cta?: CmsButton[]
  tone?: 'subtle' | 'dark' | 'brand'
}

export type CmsContentBlock =
  | CmsHeroBlock
  | CmsContentImageCtaBlock
  | CmsImageGalleryBlock
  | CmsProductSpotlightBlock
  | CmsImageCollageCtaBlock
  | CmsPinnedProductShowcaseBlock
  | CmsResourcesLearningBlock
  | CmsFeaturedProjectsBlock
  | CmsProjectsListingBlock
  | CmsStatsBlock
  | CmsCtaBannerBlock

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
    },
    _type == "imageGalleryBlock" => {
      title,
      images
    },
    _type == "productSpotlightBlock" => {
      title,
      items[]{
        _key,
        hotspotX,
        hotspotY,
        imageOverride,
        "product": product->{
          _id,
          name,
          "slug": slug.current,
          shortDescription,
          heroDescription,
          listingBadgeText,
          "category": category->title,
          listingCardImage,
          "heroImage": heroMedia[type == "image"][0].image,
          "heroMedia": heroMedia[type == "image"][0]{
            _type,
            type,
            image,
            externalImageUrl
          }
        }
      }
    },
    _type == "imageCollageCtaBlock" => {
      title,
      eyebrow,
      description,
      mainImage,
      topImage,
      bottomImage,
      cta[]{${BUTTON_QUERY_FIELDS}}
    },
    _type == "pinnedProductShowcaseBlock" => {
      title,
      detailTitle,
      description,
      backgroundImage,
      productImageOverride,
      specItems[]{
        _key,
        label,
        color
      },
      downloadLinks[]{
        _key,
        label,
        url
      },
      cta[]{${BUTTON_QUERY_FIELDS}},
      "product": product->{
        _id,
        name,
        "slug": slug.current,
        shortDescription,
        heroDescription,
        listingCardImage,
        "heroImage": heroMedia[type == "image"][0].image,
        "heroMedia": heroMedia[type == "image"][0]{
          _type,
          type,
          image,
          externalImageUrl
        },
        productAttributes[]{
          definition->{title, unit},
          numberValue,
          "numberTextValue": select(defined(numberValue) => string(numberValue), null),
          booleanValue,
          textValue,
          singleOptionValue->{label, value},
          multiOptionValues[]->{label, value}
        },
        "resources": resources[]->{
          _id,
          title,
          type,
          "url": coalesce(externalUrl, file.asset->url)
        }
      }
    },
    _type == "resourcesLearningBlock" => {
      title,
      intro,
      description,
      cta[]{${BUTTON_QUERY_FIELDS}}
    },
    _type == "featuredProjectsBlock" => {
      title,
      "projects": projects[]->{
        _id,
        title,
        "slug": slug.current,
        description,
        location,
        projectType,
        completionYear,
        coverImage
      },
      cta[]{${BUTTON_QUERY_FIELDS}}
    },
    _type == "projectsListingBlock" => {
      title,
      description,
      showAllFilter,
      allFilterLabel,
      categories[]{
        _key,
        value,
        label
      },
      maxItems
    },
    _type == "statsBlock" => {
      heading,
      stats[]{
        _key,
        value,
        label
      }
    },
    _type == "ctaBannerBlock" => {
      heading,
      description,
      tone,
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

  if (link._type === 'project') {
    return `/projects/${link.slug}`
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
