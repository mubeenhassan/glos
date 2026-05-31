import {type ResourceAsset} from '@/lib/catalog'
import {type DownloadResourceCardItem} from '@/components/resources/DownloadResourceCard'
import {formatFileSize} from '@/lib/formatFileSize'

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  datasheet: 'Datasheet',
  ies: 'IES',
  ldt: 'LDT',
  bim: 'BIM',
  manual: 'Manual',
  brochure: 'Brochure',
  certificate: 'Certificate',
  other: 'Other',
}

export function formatResourceTypeLabel(type: string) {
  const normalized = type.trim().toLowerCase()
  if (RESOURCE_TYPE_LABELS[normalized]) {
    return RESOURCE_TYPE_LABELS[normalized]
  }

  if (!normalized) {
    return 'Resource'
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function toDownloadResourceCardItem(
  resource: ResourceAsset,
): DownloadResourceCardItem | null {
  const fileUrl = resource.fileUrl || resource.externalUrl
  if (!fileUrl) {
    return null
  }

  const fileSizeLabel =
    resource.fileSizeLabel?.trim() ||
    formatFileSize(resource.fileByteSize) ||
    undefined

  return {
    categoryLabel: formatResourceTypeLabel(resource.type),
    fileSizeLabel,
    title: resource.title,
    fileUrl,
    downloadLabel: resource.downloadLabel?.trim() || 'Download PDF',
  }
}
