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
  const expectedSecret =
    process.env.SANITY_VISUAL_EDITOR_SECRET ??
    process.env.SANITY_PREVIEW_SECRET ??
    process.env.SANITY_API_PREVIEW_SECRET
  const providedSecret = request.nextUrl.searchParams.get('secret')

  if (!expectedSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        message:
          'Missing preview secret env. Set SANITY_VISUAL_EDITOR_SECRET (or SANITY_PREVIEW_SECRET).',
      },
      {status: 500},
    )
  }

  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({message: 'Invalid preview secret.'}, {status: 401})
  }

  const redirectTo = resolveRedirectPath(
    request.nextUrl.searchParams.get('preview') ??
      request.nextUrl.searchParams.get('path') ??
      request.nextUrl.searchParams.get('slug') ??
      request.nextUrl.searchParams.get('redirect'),
    request.nextUrl.origin,
  )

  const draft = await draftMode()
  draft.enable()

  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))
  response.headers.set('Cache-Control', 'no-store')
  return response
}
