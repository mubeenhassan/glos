import {SearchIcon} from '@sanity/icons'
import Link from 'next/link'
import {mediaImageUrl} from '@/lib/sanity'
import type {SiteSettings} from '@/lib/cms'
import NavigationLink from '@/components/layout/NavigationLink'

type SiteHeaderProps = {
  siteSettings: SiteSettings | null
}

export default function SiteHeader({siteSettings}: SiteHeaderProps) {
  const headerLinks = siteSettings?.headerNavigation ?? []
  const logoUrl = mediaImageUrl({image: siteSettings?.logo}, 280)
  const siteTitle = siteSettings?.title?.trim()
  const searchUrl = siteSettings?.headerSearchUrl?.trim()
  const showSearch = Boolean(siteSettings?.showHeaderSearch && searchUrl)
  const isExternalSearchUrl = Boolean(searchUrl && /^https?:\/\//.test(searchUrl))
  const showHeader = Boolean(logoUrl || siteTitle || headerLinks.length > 0 || showSearch)

  if (!showHeader) {
    return null
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {logoUrl || siteTitle ? (
          <Link href="/" className="brand">
            {logoUrl ? (
              <img className="brand-logo" src={logoUrl} alt={siteSettings?.logo?.alt || siteTitle || ''} />
            ) : (
              siteTitle
            )}
          </Link>
        ) : (
          <span className="brand-placeholder" aria-hidden />
        )}

        <nav className="top-nav">
          {headerLinks.map((item, index) => (
            <NavigationLink
              key={item._key || `${item.label || 'header-link'}-${index}`}
              item={item}
              className="top-nav-link"
            />
          ))}
        </nav>

        {showSearch ? (
          isExternalSearchUrl ? (
            <a className="top-search" href={searchUrl} aria-label="Search">
              <SearchIcon />
            </a>
          ) : (
            <Link className="top-search" href={searchUrl as string} aria-label="Search">
              <SearchIcon />
            </Link>
          )
        ) : (
          <span className="top-search-placeholder" aria-hidden />
        )}
      </div>
    </header>
  )
}
