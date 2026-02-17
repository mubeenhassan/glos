import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type RedirectRule = {
  source: string
  destination: string
  permanent?: boolean
}

type RedirectCache = {
  expiresAt: number
  items: RedirectRule[]
}

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01'
const readToken = process.env.SANITY_API_READ_TOKEN
const cacheTtlMs = 60_000
const isDev = process.env.NODE_ENV !== 'production'

let redirectCache: RedirectCache | null = null
function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

const projectId = requireEnv(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = requireEnv(process.env.NEXT_PUBLIC_SANITY_DATASET, 'NEXT_PUBLIC_SANITY_DATASET')

const configuredFrameAncestors = (
  process.env.ALLOWED_FRAME_ANCESTORS ?? process.env.NEXT_PUBLIC_ALLOWED_FRAME_ANCESTORS ?? ''
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const allowedFrameAncestors = Array.from(
  new Set([
    'http://localhost:3333',
    'https://www.sanity.studio',
    'https://*.sanity.studio',
    `https://${projectId}.sanity.studio`,
    process.env.SANITY_STUDIO_URL,
    ...configuredFrameAncestors,
  ]),
).filter(Boolean)
const frameAncestorsDirective = ["'self'", ...allowedFrameAncestors].join(' ')

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://picsum.photos https://*.picsum.photos",
  "media-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://ssl.gstatic.com",
  `connect-src 'self' https://*.sanity.io https://cdn.sanity.io${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${frameAncestorsDirective}`,
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  'X-Download-Options': 'noopen',
}

if (!isDev) {
  securityHeaders['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
}

function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  response.headers.set('X-Request-ID', crypto.randomUUID())
  return response
}

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
    pathname === '/favicon.png' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  )
}

function hasSuspiciousPath(pathname: string) {
  const suspiciousPatterns = [/\.\./, /%2e%2e/i, /\\/, /\/\/+/, /\.(env|git|svn)/i]
  return suspiciousPatterns.some((pattern) => pattern.test(pathname))
}

function hasSuspiciousQuery(searchParams: URLSearchParams) {
  const query = decodeURIComponent(searchParams.toString()).toLowerCase()
  return query.includes('<script') || query.includes('javascript:') || query.includes('%0a') || query.includes('%0d')
}

function isSafeRedirectDestination(url: URL) {
  return url.protocol === 'http:' || url.protocol === 'https:'
}

async function fetchRedirects() {
  const now = Date.now()
  if (redirectCache && redirectCache.expiresAt > now) {
    return redirectCache.items
  }

  const query = '*[_type == "redirect" && enabled == true]{source, destination, permanent}'
  const params = new URLSearchParams({ query })
  const endpoint = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?${params.toString()}`

  const response = await fetch(endpoint, {
    headers: readToken ? { Authorization: `Bearer ${readToken}` } : undefined,
    cache: 'no-store',
  })

  if (!response.ok) {
    redirectCache = { expiresAt: now + cacheTtlMs, items: [] }
    return []
  }

  const data = (await response.json()) as { result?: RedirectRule[] }
  const items = (data.result ?? []).filter((item) => item.source && item.destination)
  redirectCache = { expiresAt: now + cacheTtlMs, items }
  return items
}

export async function proxy(request: NextRequest) {
  const currentPath = normalizePath(request.nextUrl.pathname)

  if (hasSuspiciousPath(currentPath) || hasSuspiciousQuery(request.nextUrl.searchParams)) {
    return withSecurityHeaders(new NextResponse('Bad Request', { status: 400 }))
  }

  if (isIgnoredPath(currentPath)) {
    return withSecurityHeaders(NextResponse.next())
  }

  const redirects = await fetchRedirects()
  const match = redirects.find((item) => normalizePath(item.source) === currentPath)

  if (!match) {
    return withSecurityHeaders(NextResponse.next())
  }

  try {
    const destinationUrl = new URL(match.destination, request.url)
    if (!isSafeRedirectDestination(destinationUrl)) {
      return withSecurityHeaders(NextResponse.next())
    }

    const targetPath = normalizePath(destinationUrl.pathname)
    if (targetPath === currentPath && destinationUrl.origin === request.nextUrl.origin) {
      return withSecurityHeaders(NextResponse.next())
    }

    return withSecurityHeaders(NextResponse.redirect(destinationUrl, match.permanent ? 301 : 302))
  } catch {
    return withSecurityHeaders(NextResponse.next())
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico|favicon.png|robots.txt|sitemap.xml).*)'],
}
