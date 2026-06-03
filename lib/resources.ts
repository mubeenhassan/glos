import 'server-only'
import {fetchSanity} from '@/lib/sanity'
import {formatFileSize} from '@/lib/formatFileSize'

export type DownloadResourceTab =
  | 'catalogue'
  | 'brochure'
  | 'warranty'
  | 'faq'

export type ResourcesDownloadTab = {
  value: DownloadResourceTab
  label: string
}

export type DownloadResourceItem = {
  _id: string
  title: string
  tab: DownloadResourceTab
  categoryLabel: string
  fileUrl: string
  fileSizeLabel: string
  downloadLabel: string
  sortOrder: number | null
}

export const DEFAULT_RESOURCES_DOWNLOAD_TABS: ResourcesDownloadTab[] = [
  {value: 'catalogue', label: 'Catalogue'},
  {value: 'brochure', label: 'Brochure'},
  {value: 'warranty', label: 'Warranty'},
  {value: 'faq', label: 'FAQ'},
]

const TAB_LABELS: Record<DownloadResourceTab, string> = {
  catalogue: 'Catalogue',
  brochure: 'Brochure',
  warranty: 'Warranty',
  faq: 'FAQ',
}

const DOWNLOAD_RESOURCES_QUERY = `*[_type == "downloadResource" && defined(file.asset)] | order(sortOrder asc, title asc) {
  _id,
  title,
  tab,
  categoryLabel,
  fileSizeLabel,
  downloadLabel,
  sortOrder,
  "fileUrl": file.asset->url,
  "fileByteSize": file.asset->size
}`

type RawDownloadResource = {
  _id: string
  title?: string
  tab?: string
  categoryLabel?: string
  fileSizeLabel?: string
  downloadLabel?: string
  sortOrder?: number | null
  fileUrl?: string
  fileByteSize?: number
}

function isDownloadTab(value: string | undefined): value is DownloadResourceTab {
  return (
    value === 'catalogue' ||
    value === 'brochure' ||
    value === 'warranty' ||
    value === 'faq'
  )
}

export function tabLabelFor(
  value: DownloadResourceTab,
  tabs: ResourcesDownloadTab[] = DEFAULT_RESOURCES_DOWNLOAD_TABS,
) {
  return tabs.find((tab) => tab.value === value)?.label || TAB_LABELS[value] || value
}

export function normalizeResourcesDownloadTabs(
  raw?: {value?: string; label?: string}[] | null,
): ResourcesDownloadTab[] {
  if (!raw || raw.length === 0) {
    return DEFAULT_RESOURCES_DOWNLOAD_TABS
  }

  const tabs = raw
    .map((item) => {
      const value = item?.value?.trim().toLowerCase()
      if (!isDownloadTab(value)) {
        return null
      }
      return {
        value,
        label: item?.label?.trim() || tabLabelFor(value),
      }
    })
    .filter((tab): tab is ResourcesDownloadTab => Boolean(tab))

  return tabs.length > 0 ? tabs : DEFAULT_RESOURCES_DOWNLOAD_TABS
}

export function resolveActiveDownloadTab(
  tabParam: string | undefined,
  tabs: ResourcesDownloadTab[],
): DownloadResourceTab {
  const normalized = tabParam?.trim().toLowerCase()
  if (isDownloadTab(normalized) && tabs.some((tab) => tab.value === normalized)) {
    return normalized
  }
  return tabs[0]?.value || 'catalogue'
}

export async function getDownloadResources() {
  const rows = await fetchSanity<RawDownloadResource[]>(DOWNLOAD_RESOURCES_QUERY)

  return (rows || [])
    .map((row) => {
      if (!row._id || !row.title || !row.fileUrl || !isDownloadTab(row.tab)) {
        return null
      }

      const fileSizeLabel =
        row.fileSizeLabel?.trim() ||
        formatFileSize(row.fileByteSize) ||
        ''

      return {
        _id: row._id,
        title: row.title,
        tab: row.tab,
        categoryLabel: row.categoryLabel?.trim() || tabLabelFor(row.tab),
        fileUrl: row.fileUrl,
        fileSizeLabel,
        downloadLabel: row.downloadLabel?.trim() || 'Download PDF',
        sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : null,
      } satisfies DownloadResourceItem
    })
    .filter((item): item is DownloadResourceItem => Boolean(item))
}
