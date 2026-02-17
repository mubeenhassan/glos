import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

type RedirectRule = {
  source: string
  destination: string
  permanent?: boolean
}

type RedirectCache = {
  expiresAt: number
  items: RedirectRule[]
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'v5u3xa8m'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'glos'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01'
const readToken = process.env.SANITY_API_READ_TOKEN
const cacheTtlMs = 60_000

let redirectCache: RedirectCache | null = null

function normalizePath(pathname: string) {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

function isIgnoredPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  )
}

async function fetchRedirects() {
  const now = Date.now()
  if (redirectCache && redirectCache.expiresAt > now) {
    return redirectCache.items
  }

  const query = '*[_type == "redirect" && enabled == true]{source, destination, permanent}'
  const params = new URLSearchParams({query})
  const endpoint = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?${params.toString()}`

  const response = await fetch(endpoint, {
    headers: readToken ? {Authorization: `Bearer ${readToken}`} : undefined,
    cache: 'no-store',
  })

  if (!response.ok) {
    redirectCache = {expiresAt: now + cacheTtlMs, items: []}
    return []
  }

  const data = (await response.json()) as {result?: RedirectRule[]}
  const items = (data.result ?? []).filter((item) => item.source && item.destination)
  redirectCache = {expiresAt: now + cacheTtlMs, items}
  return items
}

export async function proxy(request: NextRequest) {
  const currentPath = normalizePath(request.nextUrl.pathname)

  if (isIgnoredPath(currentPath)) {
    return NextResponse.next()
  }

  const redirects = await fetchRedirects()
  const match = redirects.find((item) => normalizePath(item.source) === currentPath)

  if (!match) {
    return NextResponse.next()
  }

  const destinationUrl = new URL(match.destination, request.url)
  const targetPath = normalizePath(destinationUrl.pathname)
  if (targetPath === currentPath) {
    return NextResponse.next()
  }

  return NextResponse.redirect(destinationUrl, match.permanent ? 301 : 302)
}

export const config = {
  matcher: '/:path*',
}

