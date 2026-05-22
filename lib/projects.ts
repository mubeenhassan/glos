import 'server-only'
import {fetchSanity, type MediaItemLike, type SanityImage} from '@/lib/sanity'
import type {CmsButton, CmsImage, CmsSeo} from '@/lib/cms'

export type ProjectCardSummary = {
  _id: string
  title: string
  slug: string
  category: string | null
  shortDescription: string | null
  description: string | null
  location: string | null
  completionYear: number | null
  coverImage: CmsImage | null
  sortPriority: number | null
}

export type ProjectProductUsage = {
  _key: string
  units: number | null
  note: string | null
  product: {
    _id: string
    name: string
    slug: string
    category: string | null
    listingBadgeText: string | null
    listingCardImage: SanityImage | null
    heroImage: SanityImage | null
    heroMedia: MediaItemLike | null
  } | null
}

export type ProjectArea = {
  value: number | null
  unit: string | null
}

export type ProjectDetail = ProjectCardSummary & {
  area: ProjectArea | null
  client: string | null
  heroImage: CmsImage | null
  gallery: CmsImage[]
  productsUsed: ProjectProductUsage[]
  seo: CmsSeo | null
}

export type ProjectDetailLabels = {
  detailsTitle: string
  locationLabel: string
  yearLabel: string
  areaLabel: string
  categoryLabel: string
  clientLabel: string
  productsTitle: string
  unitsLabel: string
  breadcrumbHomeLabel: string
  breadcrumbProjectsLabel: string
}

export type ProjectsCategoryFilter = {
  value: string
  label: string
}

export type ProjectsStatTile = {
  _key: string
  value: string
  label: string
}

export type ProjectsBanner = {
  heading: string | null
  description: string | null
  cta: CmsButton[]
}

export type ProjectsPageConfig = {
  title: string
  description: string | null
  showAllFilter: boolean
  allFilterLabel: string
  categories: ProjectsCategoryFilter[]
  stats: ProjectsStatTile[]
  banner: ProjectsBanner | null
  detail: ProjectDetailLabels
  seo: CmsSeo | null
}

export const DEFAULT_PROJECT_CATEGORIES: ProjectsCategoryFilter[] = [
  {value: 'residential', label: 'Residential'},
  {value: 'retail', label: 'Retail'},
  {value: 'hospitality', label: 'Hospitality'},
  {value: 'office', label: 'Office'},
  {value: 'education', label: 'Education'},
  {value: 'art-culture', label: 'Art & Culture'},
]

const CATEGORY_TITLES: Record<string, string> = Object.fromEntries(
  DEFAULT_PROJECT_CATEGORIES.map((category) => [category.value, category.label]),
)

const DEFAULT_DETAIL_LABELS: ProjectDetailLabels = {
  detailsTitle: 'Project Details',
  locationLabel: 'Location',
  yearLabel: 'Year',
  areaLabel: 'Area',
  categoryLabel: 'Category',
  clientLabel: 'Client',
  productsTitle: 'Products Used',
  unitsLabel: 'Units',
  breadcrumbHomeLabel: 'Home',
  breadcrumbProjectsLabel: 'Projects',
}

const DEFAULT_PROJECTS_PAGE_CONFIG: ProjectsPageConfig = {
  title: 'Projects',
  description: 'Explore our portfolio of exceptional lighting installations.',
  showAllFilter: true,
  allFilterLabel: 'All',
  categories: DEFAULT_PROJECT_CATEGORIES,
  stats: [],
  banner: null,
  detail: DEFAULT_DETAIL_LABELS,
  seo: null,
}

const PROJECT_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  "category": projectType,
  shortDescription,
  description,
  location,
  completionYear,
  coverImage,
  sortPriority
`

const PROJECTS_QUERY = `*[_type == "project" && status == "published"] | order(coalesce(sortPriority, 9999) asc, coalesce(completionYear, 0) desc, title asc) {
  ${PROJECT_CARD_FIELDS}
}`

const PROJECT_DETAIL_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  ${PROJECT_CARD_FIELDS},
  area,
  client,
  heroImage{
    _type,
    alt,
    asset
  },
  "gallery": gallery[]{
    _key,
    _type,
    alt,
    asset
  },
  "productsUsed": productsUsed[]{
    _key,
    units,
    note,
    "product": product->{
      _id,
      name,
      "slug": slug.current,
      "category": category->title,
      listingBadgeText,
      listingCardImage,
      "heroImage": heroMedia[type == "image"][0].image,
      "heroMedia": heroMedia[type == "image"][0]{
        image,
        externalImageUrl
      }
    }
  },
  seo
}`

const BANNER_BUTTON_FIELDS = `
  _key,
  text,
  linkType,
  internalPath,
  externalUrl,
  openInNewTab,
  variant,
  "internalLink": internalLink->{
    _type,
    title,
    "slug": slug.current
  }
`

const PROJECTS_PAGE_CONFIG_QUERY = `*[_type == "projectsPageConfig"][0]{
  title,
  description,
  showAllFilter,
  allFilterLabel,
  "categories": categories[]{
    value,
    label
  },
  "stats": stats[]{
    _key,
    value,
    label
  },
  banner{
    heading,
    description,
    "cta": cta[]{${BANNER_BUTTON_FIELDS}}
  },
  detailsTitle,
  locationLabel,
  yearLabel,
  areaLabel,
  categoryLabel,
  clientLabel,
  productsTitle,
  unitsLabel,
  breadcrumbHomeLabel,
  breadcrumbProjectsLabel,
  seo{
    metaTitle,
    metaDescription,
    openGraphImage,
    noIndex
  }
}`

type RawProjectsPageConfig = {
  title?: string | null
  description?: string | null
  showAllFilter?: boolean | null
  allFilterLabel?: string | null
  categories?: {value?: string | null; label?: string | null}[] | null
  stats?: {_key?: string; value?: string | null; label?: string | null}[] | null
  banner?: {
    heading?: string | null
    description?: string | null
    cta?: CmsButton[] | null
  } | null
  detailsTitle?: string | null
  locationLabel?: string | null
  yearLabel?: string | null
  areaLabel?: string | null
  categoryLabel?: string | null
  clientLabel?: string | null
  productsTitle?: string | null
  unitsLabel?: string | null
  breadcrumbHomeLabel?: string | null
  breadcrumbProjectsLabel?: string | null
  seo?: CmsSeo | null
}

function pickString(value: string | null | undefined, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function pickOptionalString(value: string | null | undefined) {
  return typeof value === 'string' && value.trim() ? value : null
}

function normalizeCategories(
  raw: RawProjectsPageConfig['categories'],
): ProjectsCategoryFilter[] {
  if (!raw || raw.length === 0) {
    return DEFAULT_PROJECT_CATEGORIES
  }
  const cleaned = raw
    .map((item) => {
      const value = item?.value?.trim() || ''
      if (!value) return null
      const label = item?.label?.trim() || CATEGORY_TITLES[value] || value
      return {value, label}
    })
    .filter((item): item is ProjectsCategoryFilter => Boolean(item))
  return cleaned.length > 0 ? cleaned : DEFAULT_PROJECT_CATEGORIES
}

function normalizeStats(raw: RawProjectsPageConfig['stats']): ProjectsStatTile[] {
  if (!raw || raw.length === 0) return []
  return raw
    .map((item, index) => {
      const value = item?.value?.trim()
      const label = item?.label?.trim()
      if (!value || !label) return null
      return {
        _key: item?._key || `stat-${index}`,
        value,
        label,
      }
    })
    .filter((item): item is ProjectsStatTile => Boolean(item))
}

function normalizeBanner(raw: RawProjectsPageConfig['banner']): ProjectsBanner | null {
  if (!raw) return null
  const heading = pickOptionalString(raw.heading)
  const description = pickOptionalString(raw.description)
  const cta = Array.isArray(raw.cta) ? raw.cta.filter((b) => b && b.text) : []
  if (!heading && !description && cta.length === 0) return null
  return {heading, description, cta}
}

function normalizeProjectsPageConfig(raw: RawProjectsPageConfig | null): ProjectsPageConfig {
  if (!raw) return DEFAULT_PROJECTS_PAGE_CONFIG
  return {
    title: pickString(raw.title, DEFAULT_PROJECTS_PAGE_CONFIG.title),
    description: pickOptionalString(raw.description) || DEFAULT_PROJECTS_PAGE_CONFIG.description,
    showAllFilter:
      typeof raw.showAllFilter === 'boolean'
        ? raw.showAllFilter
        : DEFAULT_PROJECTS_PAGE_CONFIG.showAllFilter,
    allFilterLabel: pickString(raw.allFilterLabel, DEFAULT_PROJECTS_PAGE_CONFIG.allFilterLabel),
    categories: normalizeCategories(raw.categories),
    stats: normalizeStats(raw.stats),
    banner: normalizeBanner(raw.banner),
    detail: {
      detailsTitle: pickString(raw.detailsTitle, DEFAULT_DETAIL_LABELS.detailsTitle),
      locationLabel: pickString(raw.locationLabel, DEFAULT_DETAIL_LABELS.locationLabel),
      yearLabel: pickString(raw.yearLabel, DEFAULT_DETAIL_LABELS.yearLabel),
      areaLabel: pickString(raw.areaLabel, DEFAULT_DETAIL_LABELS.areaLabel),
      categoryLabel: pickString(raw.categoryLabel, DEFAULT_DETAIL_LABELS.categoryLabel),
      clientLabel: pickString(raw.clientLabel, DEFAULT_DETAIL_LABELS.clientLabel),
      productsTitle: pickString(raw.productsTitle, DEFAULT_DETAIL_LABELS.productsTitle),
      unitsLabel: pickString(raw.unitsLabel, DEFAULT_DETAIL_LABELS.unitsLabel),
      breadcrumbHomeLabel: pickString(
        raw.breadcrumbHomeLabel,
        DEFAULT_DETAIL_LABELS.breadcrumbHomeLabel,
      ),
      breadcrumbProjectsLabel: pickString(
        raw.breadcrumbProjectsLabel,
        DEFAULT_DETAIL_LABELS.breadcrumbProjectsLabel,
      ),
    },
    seo: raw.seo || null,
  }
}

export async function getProjects(): Promise<ProjectCardSummary[]> {
  const projects = await fetchSanity<ProjectCardSummary[]>(PROJECTS_QUERY)
  return projects || []
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return fetchSanity<ProjectDetail | null>(PROJECT_DETAIL_QUERY, {slug})
}

export async function getProjectsPageConfig(): Promise<ProjectsPageConfig> {
  const raw = await fetchSanity<RawProjectsPageConfig | null>(PROJECTS_PAGE_CONFIG_QUERY)
  return normalizeProjectsPageConfig(raw)
}

export function categoryLabelFor(
  value: string | null | undefined,
  categories: ProjectsCategoryFilter[],
) {
  if (!value) return null
  const match = categories.find((category) => category.value === value)
  return match?.label || CATEGORY_TITLES[value] || value
}
