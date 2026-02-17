import {draftMode} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'

function safeDecodeUri(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function resolveRedirectPath(rawPath: string | null, requestOrigin: string, fallback = '/products') {
  if (!rawPath) return fallback

  const decoded = safeDecodeUri(rawPath).trim()

  if (!decoded || /[\u0000-\u001F\u007F]/.test(decoded)) {
    return fallback
  }

  if (decoded.startsWith('/') && !decoded.startsWith('//')) {
    return decoded
  }

  try {
    const parsed = new URL(decoded)
    if (parsed.origin !== requestOrigin) {
      return fallback
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback
  } catch {
    return fallback
  }
}

export async function GET(request: NextRequest) {
  const redirectTo = resolveRedirectPath(
    request.nextUrl.searchParams.get('redirect') ?? request.headers.get('referer'),
    request.nextUrl.origin,
  )

  const draft = await draftMode()
  draft.disable()

  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))
  response.headers.set('Cache-Control', 'no-store')
  return response
}
