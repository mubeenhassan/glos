import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {Manrope, Sora} from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import VisualEditingBridge from './visual-editing'
import HeaderAutoHide from '@/components/layout/HeaderAutoHide'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import {getSiteSettings} from '@/lib/cms'
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
  const hasHeaderContent = Boolean(
    mediaImageUrl({image: siteSettings?.logo}, 280) ||
      siteSettings?.title?.trim() ||
      (siteSettings?.headerNavigation?.length ?? 0) > 0 ||
      (siteSettings?.showHeaderSearch && siteSettings?.headerSearchUrl?.trim()),
  )
  const bodyClassName = [
    mainFont.variable,
    displayFont.variable,
    hasHeaderContent ? 'has-site-header' : '',
    isDraftModeEnabled ? 'has-preview-bar' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <html lang="en">
      <body className={bodyClassName}>
        <div className="site-shell">
          {isDraftModeEnabled ? (
            <>
              <div className="preview-bar">
                <div className="preview-bar-inner">
                  <span>Live editing is enabled (draft mode)</span>
                  <Link href="/api/draft-mode/disable?redirect=/">Exit live editing</Link>
                </div>
              </div>
              <VisualEditingBridge />
            </>
          ) : null}

          <SiteHeader siteSettings={siteSettings} />
          <HeaderAutoHide />

          {children}

          <SiteFooter siteSettings={siteSettings} />
        </div>
      </body>
    </html>
  )
}
