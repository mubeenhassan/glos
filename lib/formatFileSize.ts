export function formatFileSize(bytes: number | null | undefined) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) {
    return null
  }

  const units = ['B', 'KB', 'MB', 'GB'] as const
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const formatted =
    unitIndex === 0 ? String(Math.round(size)) : size.toFixed(1).replace(/\.0$/, '')

  return `${formatted} ${units[unitIndex]}`
}
