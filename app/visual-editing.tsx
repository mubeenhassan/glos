'use client'

import {VisualEditing} from '@sanity/visual-editing/react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useMemo, useRef} from 'react'
import type {HistoryAdapterNavigate, HistoryUpdate} from '@sanity/visual-editing'

function getCurrentUrl(pathname: string, searchParams: {toString(): string}) {
  const search = searchParams.toString()
  return search ? `${pathname}?${search}` : pathname
}

export default function VisualEditingBridge() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const listenersRef = useRef<Set<HistoryAdapterNavigate>>(new Set())
  const currentUrl = getCurrentUrl(pathname, searchParams)

  useEffect(() => {
    listenersRef.current.forEach((navigate) =>
      navigate({
        type: 'replace',
        url: currentUrl,
      }),
    )
  }, [currentUrl])

  const history = useMemo(
    () => ({
      subscribe: (navigate: HistoryAdapterNavigate) => {
        listenersRef.current.add(navigate)

        const onPopState = () =>
          navigate({
            type: 'pop',
            url: `${window.location.pathname}${window.location.search}`,
          })

        window.addEventListener('popstate', onPopState)

        return () => {
          listenersRef.current.delete(navigate)
          window.removeEventListener('popstate', onPopState)
        }
      },
      update: (update: HistoryUpdate) => {
        if (update.type === 'push') {
          router.push(update.url)
          return
        }

        if (update.type === 'replace') {
          router.replace(update.url)
          return
        }

        router.back()
      },
    }),
    [router],
  )

  return (
    <VisualEditing
      history={history}
      refresh={async () => {
        router.refresh()
      }}
      portal
      zIndex={1200}
    />
  )
}
