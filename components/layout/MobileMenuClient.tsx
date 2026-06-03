'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'
import {createPortal} from 'react-dom'

const CLOSE_MOBILE_MENU_EVENT = 'glos:close-mobile-menu'
const CLOSE_MOBILE_FILTERS_EVENT = 'glos:close-mobile-filters'

export type MobileLink = {
  label: string
  href: string
  isExternal?: boolean
  openInNewTab?: boolean
}

type Props = {
  links: MobileLink[]
  siteName?: string
  logoUrl?: string
}

export default function MobileMenuClient({links, siteName, logoUrl}: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    function handleCloseMenu() {
      setOpen(false)
    }

    document.addEventListener(CLOSE_MOBILE_MENU_EVENT, handleCloseMenu)
    return () => {
      document.removeEventListener(CLOSE_MOBILE_MENU_EVENT, handleCloseMenu)
    }
  }, [])

  if (links.length === 0) return null

  const close = () => setOpen(false)

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="mobile-hamburger flex md:hidden"
        onClick={() => {
          document.dispatchEvent(new Event(CLOSE_MOBILE_FILTERS_EVENT))
          setOpen(true)
        }}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-menu-overlay"
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {/* Full-screen overlay */}
      {mounted && open
        ? createPortal(
        <div
          id="mobile-menu-overlay"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          {/* Top bar */}
          <div className="mobile-menu-topbar">
            <Link href="/" className="mobile-menu-brand" onClick={close}>
              {logoUrl ? (
                <img src={logoUrl} alt={siteName ?? ''} className="mobile-menu-logo" />
              ) : (
                <span>{siteName}</span>
              )}
            </Link>
            <button
              className="mobile-menu-close-btn"
              onClick={close}
              aria-label="Close navigation menu"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M1.5 1.5L14.5 14.5M14.5 1.5L1.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="mobile-menu-nav" aria-label="Main navigation">
            {links.map((link, i) =>
              link.isExternal ? (
                <a
                  key={`${link.href}-${i}`}
                  className="mobile-menu-link"
                  style={{animationDelay: `${60 + i * 55}ms`}}
                  href={link.href}
                  target={link.openInNewTab ? '_blank' : undefined}
                  rel={link.openInNewTab ? 'noreferrer noopener' : undefined}
                  onClick={close}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={`${link.href}-${i}`}
                  className="mobile-menu-link"
                  style={{animationDelay: `${60 + i * 55}ms`}}
                  href={link.href}
                  onClick={close}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* Bottom accent */}
          <div className="mobile-menu-foot">
            <span className="mobile-menu-foot-bar" aria-hidden="true" />
            {siteName && <span className="mobile-menu-foot-name">{siteName}</span>}
          </div>
        </div>,
          document.body,
        )
        : null}
    </>
  )
}
