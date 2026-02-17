import Link from 'next/link'
import {mediaImageUrl} from '@/lib/sanity'
import {resolveButtonHref, type CmsButton, type CmsContentBlock, type CmsPage} from '@/lib/cms'

function buttonVariantClassName(button: CmsButton | undefined) {
  const variant = button?.variant || 'primary'
  return `btn btn-${variant}`
}

function CmsButtonLink({button}: {button: CmsButton | undefined}) {
  if (!button?.text) {
    return null
  }

  const resolved = resolveButtonHref(button)
  const className = buttonVariantClassName(button)

  if (!resolved.href) {
    return (
      <span className={`${className} btn-disabled`} aria-disabled>
        {button.text}
      </span>
    )
  }

  if (resolved.isExternal) {
    return (
      <a
        className={className}
        href={resolved.href}
        target={resolved.openInNewTab ? '_blank' : undefined}
        rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
      >
        {button.text}
      </a>
    )
  }

  return <Link className={className} href={resolved.href}>{button.text}</Link>
}

function HeroBlockSection({block}: {block: Extract<CmsContentBlock, {_type: 'heroBlock'}>}) {
  const backgroundImageUrl =
    block.backgroundMedia?.type === 'image'
      ? mediaImageUrl(block.backgroundMedia, 2400)
      : null
  const backgroundVideoUrl = block.backgroundMedia?.type === 'video' ? block.backgroundMedia.videoUrl : null
  const overlayOpacity = typeof block.overlayOpacity === 'number' ? block.overlayOpacity / 100 : 0.45

  return (
    <section className="hero-panel cms-hero-block">
      {backgroundVideoUrl ? (
        <div className="cms-hero-bg" aria-hidden>
          <video autoPlay muted loop playsInline>
            <source src={backgroundVideoUrl} />
          </video>
        </div>
      ) : backgroundImageUrl ? (
        <div className="cms-hero-bg" aria-hidden>
          <img src={backgroundImageUrl} alt="" />
        </div>
      ) : null}
      <div className="cms-hero-overlay" style={{opacity: overlayOpacity}} aria-hidden />

      <div className="cms-hero-content">
        <h1>{block.title || 'Untitled section'}</h1>
        {block.description ? <p>{block.description}</p> : null}
        {block.cta && block.cta.length > 0 ? (
          <div className="cta-row hero-cta-row">
            {block.cta.map((button, index) => (
              <CmsButtonLink key={button._key || `${button.text}-${index}`} button={button} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function ContentImageCtaSection({block}: {block: Extract<CmsContentBlock, {_type: 'contentImageCta'}>}) {
  const imageUrl = mediaImageUrl({image: block.mainImage}, 1400)
  const imageFirst = block.imagePosition === 'left'

  return (
    <section className="section cms-split">
      <div className={`cms-split-grid ${imageFirst ? 'is-image-first' : ''}`}>
        <div className="cms-split-copy">
          <h2 className="section-heading">{block.title || 'Untitled section'}</h2>
          {block.description ? <p>{block.description}</p> : null}
          {block.cta && block.cta.length > 0 ? (
            <div className="cta-row">
              {block.cta.map((button, index) => (
                <CmsButtonLink key={button._key || `${button.text}-${index}`} button={button} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="cms-split-media">
          {imageUrl ? (
            <img src={imageUrl} alt={block.mainImage?.alt || block.title || 'Section image'} />
          ) : (
            <div className="cms-image-placeholder">No image selected</div>
          )}
        </div>
      </div>
    </section>
  )
}

function RenderBlock({block}: {block: CmsContentBlock}) {
  if (block._type === 'heroBlock') {
    return <HeroBlockSection block={block} />
  }

  if (block._type === 'contentImageCta') {
    return <ContentImageCtaSection block={block} />
  }

  return null
}

export function CmsPageView({page}: {page: CmsPage}) {
  const blocks = page.contentBlocks ?? []
  const hasLeadingHero = blocks[0]?._type === 'heroBlock'

  if (blocks.length === 0) {
    return (
      <main className="page-wrap">
        <section className="hero-panel">
          <h1>{page.title || 'Untitled page'}</h1>
          <p>No content blocks have been added to this page yet.</p>
        </section>
      </main>
    )
  }

  return (
    <main className={`page-wrap cms-page${hasLeadingHero ? ' has-leading-hero' : ''}`}>
      {blocks.map((block, index) => (
        <RenderBlock key={block._key || `${block._type}-${index}`} block={block} />
      ))}
    </main>
  )
}

export function CmsButtonsRow({buttons}: {buttons: CmsButton[] | undefined}) {
  if (!buttons || buttons.length === 0) {
    return null
  }

  return (
    <div className="cta-row">
      {buttons.map((button, index) => (
        <CmsButtonLink key={button._key || `${button.text}-${index}`} button={button} />
      ))}
    </div>
  )
}
