/**
 * Normalizes a Google Maps embed URL from Sanity.
 * Accepts a direct embed src or full iframe HTML from Google Maps "Share → Embed".
 */
export function normalizeGoogleMapsEmbedUrl(input?: string | null): string | null {
  const trimmed = input?.trim()
  if (!trimmed) {
    return null
  }

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i)
  const candidate = (srcMatch?.[1] || trimmed).trim()

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:') {
      return null
    }

    const allowedHosts = new Set([
      'www.google.com',
      'google.com',
      'maps.google.com',
    ])

    if (!allowedHosts.has(url.hostname)) {
      return null
    }

    if (!url.pathname.startsWith('/maps/embed')) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}
