import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {Manrope, Sora} from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import VisualEditingBridge from './visual-editing'
import {getSiteSettings, resolveNavigationHref} from '@/lib/cms'
import {mediaImageUrl} from '@/lib/sanity'

const mainFont = Manrope({
  subsets: ['latin'],
  variable: '--font-main',
})

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'GLOS Lighting',
  description: 'Sanity-powered product listing, detail, and SKU configurator',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {isEnabled: isDraftModeEnabled} = await draftMode()
  const siteSettings = await getSiteSettings()
  const headerNav = siteSettings?.headerNavigation ?? []
  const footerNav = siteSettings?.footerColumns ?? []
  const socialLinks = siteSettings?.socialLinks ?? []
  const logoUrl = mediaImageUrl({image: siteSettings?.logo}, 280)
  const footerLogoUrl = mediaImageUrl({image: siteSettings?.footerLogo || siteSettings?.logo}, 220)

  return (
    <html lang="en">
      <body className={`${mainFont.variable} ${displayFont.variable}`}>
        <div className="site-shell">
          {isDraftModeEnabled && (
            <>
              <div className="preview-bar">
                <div className="preview-bar-inner">
                  <span>Live editing is enabled (draft mode)</span>
                  <Link href="/api/draft-mode/disable?redirect=/">Exit live editing</Link>
                </div>
              </div>
              <VisualEditingBridge />
            </>
          )}

          <header className="topbar">
            <div className="topbar-inner">
              <Link href="/" className="brand">
                {logoUrl ? (
                  <img
                    className="brand-logo"
                    src={logoUrl}
                    alt={siteSettings?.logo?.alt || siteSettings?.title || 'Site logo'}
                  />
                ) : (
                  <>
                    glos<span>.</span>
                  </>
                )}
              </Link>
              <nav className="top-nav">
                {headerNav.length > 0 ? (
                  headerNav.map((item) => {
                    const resolved = resolveNavigationHref(item)
                    const label = item.label || item.internalLink?.title || 'Untitled'
                    const hasChildren = Boolean(item.children && item.children.length > 0)

                    if (hasChildren) {
                      return (
                        <div key={item._key || label} className="top-nav-group">
                          {resolved.href ? (
                            resolved.isExternal ? (
                              <a
                                href={resolved.href}
                                target={resolved.openInNewTab ? '_blank' : undefined}
                                rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
                              >
                                {label}
                              </a>
                            ) : (
                              <Link href={resolved.href}>{label}</Link>
                            )
                          ) : (
                            <span>{label}</span>
                          )}

                          <div className="top-nav-menu">
                            {item.children?.map((child) => {
                              const childResolved = resolveNavigationHref(child)
                              const childLabel = child.label || child.internalLink?.title || 'Untitled'

                              if (!childResolved.href) {
                                return null
                              }

                              return childResolved.isExternal ? (
                                <a
                                  key={child._key || childLabel}
                                  href={childResolved.href}
                                  target={childResolved.openInNewTab ? '_blank' : undefined}
                                  rel={childResolved.openInNewTab ? 'noreferrer noopener' : undefined}
                                >
                                  {childLabel}
                                </a>
                              ) : (
                                <Link key={child._key || childLabel} href={childResolved.href}>
                                  {childLabel}
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }

                    if (!resolved.href) {
                      return null
                    }

                    return resolved.isExternal ? (
                      <a
                        key={item._key || label}
                        href={resolved.href}
                        target={resolved.openInNewTab ? '_blank' : undefined}
                        rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
                      >
                        {label}
                      </a>
                    ) : (
                      <Link key={item._key || label} href={resolved.href}>
                        {label}
                      </Link>
                    )
                  })
                ) : (
                  <>
                    <Link href="/products">Products</Link>
                    <Link href="/configurator/product/inter-angled-linear-light">Configurator</Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          {children}

          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-nav">
                {footerLogoUrl ? (
                  <Link href="/" className="footer-logo-link">
                    <img
                      className="brand-logo"
                      src={footerLogoUrl}
                      alt={siteSettings?.footerLogo?.alt || siteSettings?.logo?.alt || 'Footer logo'}
                    />
                  </Link>
                ) : null}
                {footerNav.map((item) => {
                  const resolved = resolveNavigationHref(item)
                  const label = item.label || item.internalLink?.title || 'Untitled'

                  if (!resolved.href) {
                    return null
                  }

                  return resolved.isExternal ? (
                    <a
                      key={item._key || label}
                      href={resolved.href}
                      target={resolved.openInNewTab ? '_blank' : undefined}
                      rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link key={item._key || label} href={resolved.href}>
                      {label}
                    </Link>
                  )
                })}
              </div>
              <div className="footer-meta">
                {siteSettings?.footerText ? <span>{siteSettings.footerText}</span> : null}
                {socialLinks.length > 0 ? (
                  <span className="social-row">
                    {socialLinks.map((item) => (
                      <a key={item._key || item.url || item.platform} href={item.url} target="_blank" rel="noreferrer noopener">
                        {item.platform}
                      </a>
                    ))}
                  </span>
                ) : null}
                {!siteSettings?.footerText && socialLinks.length === 0 ? (
                  <>
                    <span>GLOS Product Platform</span>
                    <span>Sanity CMS + Next.js</span>
                  </>
                ) : null}
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
