import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {Manrope, Sora} from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import VisualEditingBridge from './visual-editing'

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

  return (
    <html lang="en">
      <body className={`${mainFont.variable} ${displayFont.variable}`}>
        <div className="site-shell">
          {isDraftModeEnabled && (
            <>
              <div className="preview-bar">
                <div className="preview-bar-inner">
                  <span>Live editing is enabled (draft mode)</span>
                  <Link href="/api/draft-mode/disable">Exit live editing</Link>
                </div>
              </div>
              <VisualEditingBridge />
            </>
          )}

          <header className="topbar">
            <div className="topbar-inner">
              <Link href="/" className="brand">
                glos<span>.</span>
              </Link>
              <nav className="top-nav">
                <Link href="/products">Products</Link>
                <Link href="/configurator/product/inter-angled-linear-light">Configurator</Link>
              </nav>
            </div>
          </header>

          {children}

          <footer className="footer">
            <div className="footer-inner">
              <span>GLOS Product Platform</span>
              <span>Sanity CMS + Next.js</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
