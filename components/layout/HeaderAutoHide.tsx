'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

const HIDE_DELAY_MS = 2800
const REVEAL_ZONE_PX = 44

export default function HeaderAutoHide() {
  const pathname = usePathname()

  useEffect(() => {
    const body = document.body
    const isHome = pathname === '/'
    const supportsHoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    body.classList.remove('header-autohide', 'header-hidden')

    if (isHome || !supportsHoverPointer) {
      return
    }

    body.classList.add('header-autohide')

    let hideTimer: ReturnType<typeof setTimeout> | undefined
    let isNearTop = false

    const clearHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
    }

    const scheduleHide = () => {
      clearHideTimer()
      hideTimer = setTimeout(() => {
        body.classList.add('header-hidden')
      }, HIDE_DELAY_MS)
    }

    const showHeader = () => {
      body.classList.remove('header-hidden')
    }

    const onMouseMove = (event: MouseEvent) => {
      const nearTopNow = event.clientY <= REVEAL_ZONE_PX

      if (nearTopNow) {
        isNearTop = true
        showHeader()
        clearHideTimer()
        return
      }

      if (isNearTop) {
        isNearTop = false
      }

      if (!body.classList.contains('header-hidden')) {
        scheduleHide()
      }
    }

    showHeader()
    scheduleHide()
    window.addEventListener('mousemove', onMouseMove, {passive: true})

    return () => {
      clearHideTimer()
      window.removeEventListener('mousemove', onMouseMove)
      body.classList.remove('header-autohide', 'header-hidden')
    }
  }, [pathname])

  return null
}
