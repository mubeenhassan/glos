import {
  EnvelopeIcon,
  MarkerIcon,
  MobileDeviceIcon,
} from '@sanity/icons'
import Link from 'next/link'
import {
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import {mediaImageUrl} from '@/lib/sanity'
import {resolveNavigationHref, type CmsInternalLink, type SiteSettings} from '@/lib/cms'
import NavigationLink from '@/components/layout/NavigationLink'

type SiteFooterProps = {
  siteSettings: SiteSettings | null
}

type SocialKind = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'x' | 'youtube' | 'github' | 'other'

function inferSocialKind(platform?: string, url?: string): SocialKind {
  const compactPlatform = (platform || '').toLowerCase().replace(/[^a-z0-9]/g, '')

  if (compactPlatform === 'facebook' || compactPlatform === 'fb') {
    return 'facebook'
  }
  if (compactPlatform === 'instagram' || compactPlatform === 'ig') {
    return 'instagram'
  }
  if (compactPlatform === 'linkedin' || compactPlatform === 'linkedinin') {
    return 'linkedin'
  }
  if (compactPlatform === 'twitter') {
    return 'twitter'
  }
  if (compactPlatform === 'x' || compactPlatform === 'xtwitter' || compactPlatform === 'twitterx') {
    return 'x'
  }
  if (compactPlatform === 'youtube' || compactPlatform === 'yt') {
    return 'youtube'
  }
  if (compactPlatform === 'github' || compactPlatform === 'gh') {
    return 'github'
  }

  if (!url) {
    return 'other'
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (hostname.includes('facebook.com')) return 'facebook'
    if (hostname.includes('instagram.com')) return 'instagram'
    if (hostname.includes('linkedin.com')) return 'linkedin'
    if (hostname === 'x.com' || hostname.endsWith('.x.com')) return 'x'
    if (hostname.includes('twitter.com')) return 'twitter'
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
    if (hostname.includes('github.com')) return 'github'
  } catch {
    return 'other'
  }

  return 'other'
}

function SocialPlatformIcon({platform, url}: {platform?: string; url?: string}) {
  const kind = inferSocialKind(platform, url)

  if (kind === 'facebook') return <FaFacebookF />
  if (kind === 'instagram') return <FaInstagram />
  if (kind === 'linkedin') return <FaLinkedinIn />
  if (kind === 'twitter') return <FaTwitter />
  if (kind === 'x') return <FaXTwitter />
  if (kind === 'youtube') return <FaYoutube />
  if (kind === 'github') return <FaGithub />
  return <FaGlobe />
}

function FooterColumnTitle({
  title,
  titleLinkType,
  titleInternalLink,
  titlePath,
  titleExternalUrl,
  titleOpenInNewTab,
}: {
  title: string | undefined
  titleLinkType: 'none' | 'internal' | 'path' | 'external' | undefined
  titleInternalLink: CmsInternalLink | null | undefined
  titlePath: string | undefined
  titleExternalUrl: string | undefined
  titleOpenInNewTab: boolean | undefined
}) {
  if (!title) {
    return null
  }

  if (!titleLinkType || titleLinkType === 'none') {
    return <h4>{title}</h4>
  }

  const resolved = resolveNavigationHref({
    linkType: titleLinkType,
    internalLink: titleInternalLink,
    internalPath: titlePath,
    externalUrl: titleExternalUrl,
    openInNewTab: titleOpenInNewTab,
  })

  if (!resolved.href) {
    return <h4>{title}</h4>
  }

  if (resolved.isExternal) {
    return (
      <h4>
        <a
          className="footer-column-title-link"
          href={resolved.href}
          target={resolved.openInNewTab ? '_blank' : undefined}
          rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
        >
          {title}
        </a>
      </h4>
    )
  }

  return (
    <h4>
      <Link className="footer-column-title-link" href={resolved.href}>
        {title}
      </Link>
    </h4>
  )
}

export default function SiteFooter({siteSettings}: SiteFooterProps) {
  const footerLinkColumns = siteSettings?.footerLinkColumns ?? []
  const footerLegalLinks = siteSettings?.footerLegalLinks ?? []
  const socialLinks = (siteSettings?.socialLinks ?? []).filter((item) => Boolean(item.url))
  const footerLogoUrl = mediaImageUrl({image: siteSettings?.footerLogo || siteSettings?.logo}, 220)
  const footerTitle = siteSettings?.title?.trim()
  const footerDescription = siteSettings?.footerDescription?.trim()
  const footerAddress = siteSettings?.footerContactAddress?.trim()
  const footerPhone = siteSettings?.footerContactPhone?.trim()
  const footerEmail = siteSettings?.footerContactEmail?.trim()
  const footerPhoneHref = footerPhone?.replace(/\s+/g, '')
  const footerCopyright = siteSettings?.footerCopyright?.trim()

  const showBrandColumn = Boolean(footerLogoUrl || footerTitle || footerDescription || socialLinks.length > 0)
  const showLinkColumns = footerLinkColumns.some((column) => {
    const title = column.title?.trim()
    const links = (column.links ?? []).filter((item) => Boolean(item.label || item.internalLink?.title))
    return Boolean(title || links.length > 0)
  })
  const showContactColumn = Boolean(
    siteSettings?.footerContactTitle || footerAddress || footerPhone || footerEmail,
  )
  const showBottomBar = Boolean(footerCopyright || footerLegalLinks.length > 0)
  const showFooter = Boolean(
    showBrandColumn || showLinkColumns || showContactColumn || showBottomBar,
  )

  if (!showFooter) {
    return null
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className={`footer-grid${showBrandColumn ? '' : ' no-brand'}`}>
          {showBrandColumn ? (
            <div className="footer-brand-col">
              {footerLogoUrl || footerTitle ? (
                <Link href="/" className={footerLogoUrl ? 'footer-logo-link' : 'footer-wordmark'}>
                  {footerLogoUrl ? (
                    <img className="brand-logo" src={footerLogoUrl} alt={siteSettings?.footerLogo?.alt || footerTitle || ''} />
                  ) : (
                    footerTitle
                  )}
                </Link>
              ) : null}

              {footerDescription ? <p className="footer-description">{footerDescription}</p> : null}

              {socialLinks.length > 0 ? (
                <div className="footer-social-row">
                  {socialLinks.map((item) => (
                    <a
                      key={item._key || `${item.platform}-${item.url}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={item.platform || 'Social link'}
                      className="footer-icon-circle"
                    >
                      <SocialPlatformIcon platform={item.platform} url={item.url} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {footerLinkColumns.map((column, columnIndex) => {
            const title = column.title?.trim()
            const links = (column.links ?? []).filter((item) => Boolean(item.label || item.internalLink?.title))

            if (!title && links.length === 0) {
              return null
            }

            return (
              <div className="footer-col" key={column._key || `${title || 'footer-column'}-${columnIndex}`}>
                <FooterColumnTitle
                  title={title}
                  titleLinkType={column.titleLinkType}
                  titleInternalLink={column.titleInternalLink}
                  titlePath={column.titlePath}
                  titleExternalUrl={column.titleExternalUrl}
                  titleOpenInNewTab={column.titleOpenInNewTab}
                />
                <div className="footer-links">
                  {links.map((item, index) => (
                    <NavigationLink
                      key={item._key || `${item.label || 'footer-column-link'}-${index}`}
                      item={item}
                      className="footer-link-item"
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {showContactColumn ? (
            <div className="footer-col">
              {siteSettings?.footerContactTitle ? <h4>{siteSettings.footerContactTitle}</h4> : null}
              <div className="footer-contact-list">
                {footerAddress ? (
                  <div className="footer-contact-item">
                    <span className="footer-icon-circle">
                      <MarkerIcon />
                    </span>
                    <span>{footerAddress}</span>
                  </div>
                ) : null}

                {footerPhone && footerPhoneHref ? (
                  <div className="footer-contact-item">
                    <span className="footer-icon-circle">
                      <MobileDeviceIcon />
                    </span>
                    <a href={`tel:${footerPhoneHref}`}>{footerPhone}</a>
                  </div>
                ) : null}

                {footerEmail ? (
                  <div className="footer-contact-item">
                    <span className="footer-icon-circle">
                      <EnvelopeIcon />
                    </span>
                    <a href={`mailto:${footerEmail}`}>{footerEmail}</a>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {showBottomBar ? (
          <>
            <div className="footer-divider" />

            <div className="footer-bottom">
              {footerCopyright ? <span>{footerCopyright}</span> : <span />}
              <div className="footer-legal-links">
                {footerLegalLinks.map((item, index) => (
                  <NavigationLink
                    key={item._key || `${item.label || 'footer-legal-link'}-${index}`}
                    item={item}
                    className="footer-legal-link"
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </footer>
  )
}
