import {draftMode} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'

function resolveRedirectPath(rawPath: string | null, fallback = '/products') {
  if (!rawPath) return fallback

  const decoded = decodeURIComponent(rawPath)

  if (decoded.startsWith('/')) {
    return decoded
  }

  try {
    const parsed = new URL(decoded)
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback
  } catch {
    return fallback
  }
}

export async function GET(request: NextRequest) {
  const redirectTo = resolveRedirectPath(
    request.nextUrl.searchParams.get('redirect') ?? request.headers.get('referer'),
  )

  const draft = await draftMode()
  draft.disable()

  return NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))
}
