import Link from 'next/link'
import {stegaClean} from '@sanity/client/stega'
import {createDataAttribute} from '@sanity/visual-editing/create-data-attribute'
import {mediaImageUrl, sanityImageUrl} from '@/lib/sanity'
import {resolveButtonHref, type CmsButton, type CmsContentBlock, type CmsPage} from '@/lib/cms'
import PinnedProductShowcase from '@/components/PinnedProductShowcase'
import FeaturedProjectsSlider, {type FeaturedProjectSlide} from '@/components/FeaturedProjectsSlider'
import HeroGsapAnimations from '@/components/HeroGsapAnimations'
import GalleryAnimations from '@/components/GalleryAnimations'
import ProductSpotlightClient, {type SpotlightItem} from '@/components/ProductSpotlightClient'
import ImageCollageAnimations from '@/components/ImageCollageAnimations'
import ResourcesProjectsAnimations from '@/components/ResourcesProjectsAnimations'

function buttonVariantClassName(button: CmsButton | undefined) {
  const variant = button?.variant || 'primary'
  return `btn btn-${variant}`
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function CmsButtonLink({button, className}: {button: CmsButton | undefined; className?: string}) {
  if (!button?.text) {
    return null
  }

  const resolved = resolveButtonHref(button)
  const buttonClassName = [buttonVariantClassName(button), className].filter(Boolean).join(' ')

  if (!resolved.href) {
    return (
      <span className={`${buttonClassName} btn-disabled`} aria-disabled>
        {button.text}
      </span>
    )
  }

  if (resolved.isExternal) {
    return (
      <a
        className={buttonClassName}
        href={resolved.href}
        target={resolved.openInNewTab ? '_blank' : undefined}
        rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
      >
        {button.text}
      </a>
    )
  }

  return <Link className={buttonClassName} href={resolved.href}>{button.text}</Link>
}

const heroSectionClassName =
  'cms-hero-block relative md:mx-auto md:mt-1 min-h-screen md:block flex items-center justify-center w-full md:w-[calc(100%_-_8px)] overflow-hidden md:rounded-2xl bg-[#111111] px-5 pb-11 pt-32 text-white md:min-h-[560px] md:px-6 md:pb-16 md:pt-40 lg:min-h-[640px] lg:px-12 lg:pt-44 xl:min-h-[clamp(610px,72vh,1040px)] lg:w-[min(100%_-_8px,1728px)] lg:px-[clamp(28px,4.2vw,74px)] lg:pb-[clamp(64px,9vh,122px)] lg:pt-[clamp(150px,16vh,218px)]'

const heroBackgroundClassName = 'absolute inset-0'

const heroBackgroundMediaClassName = 'h-full w-full object-cover'

const heroOverlayClassName =
  'absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.22)_100%),linear-gradient(180deg,rgba(0,0,0,0.26)_0%,rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.42)_100%)]'

const heroContentBaseClassName =
  'cms-hero-content relative z-[2] grid md:min-h-[344px] w-full min-w-0 grid-cols-1 items-center justify-center md:items-start gap-6 text-left md:min-h-[360px] lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)] lg:items-end lg:gap-11 xl:min-h-[calc(clamp(610px,72vh,940px)_-_clamp(150px,16vh,218px)_-_clamp(64px,9vh,122px))] xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.54fr)] xl:gap-[clamp(32px,7vw,136px)] '

const heroContentAlignmentClassNames = {
  left: '',
  center: 'lg:grid-cols-[minmax(0,920px)] lg:justify-center lg:text-center',
  right: 'lg:grid-cols-[minmax(300px,0.7fr)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,0.54fr)_minmax(0,1fr)]',
}

const heroTitleColumnBaseClassName = 'cms-hero-title-column self-start'

const heroActionColumnBaseClassName = 'cms-hero-action-column self-end max-w-[620px]'

const heroTitleClassName =
  'm-0 text-[2rem] font-[600] leading-[1.08] md:text-left text-center tracking-normal text-white md:text-5xl lg:text-[5rem] '

const heroWordOuterClassName =
  'hero-word-outer inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom md:pb-[0.1em] md:-mb-[0.1em]'

const heroDescriptionClassName =
  'md:mt-3.5 text-center md:text-left text-base leading-[1.32] text-white/[0.92] md:m-0 md:text-[clamp(0.96rem,2.2vw,1.16rem)] lg:text-[20px] lg:leading-[1.28]'

const heroCtaRowBaseClassName =
  'js-hero-cta-row mt-5 flex flex-wrap gap-3 md:mt-7 lg:mt-[clamp(24px,2.6vw,38px)]'

const heroButtonClassName =
  '!min-h-12 !w-full !min-w-full !rounded-[8px] !border-[var(--color-brand-orange)] !bg-[var(--color-brand-orange)] !px-3.5 !py-2.5 !text-[0.9rem] !font-extrabold !text-white hover:!border-[var(--color-brand-orange-hover)] hover:!bg-[var(--color-brand-orange-hover)] focus-visible:!border-[var(--color-brand-orange-hover)] focus-visible:!bg-[var(--color-brand-orange-hover)] md:!w-auto md:!min-w-[200px] md:!px-5 md:!py-3 md:!text-[0.94rem] lg:!min-h-[68px] lg:!min-w-[260px] lg:!rounded-lg lg:!px-7 lg:!py-3.5 lg:!text-[clamp(0.9rem,0.84vw,1rem)]'

const sectionHeadingClassName =
  'm-0 font-[600] text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#121827] md:text-4xl lg:text-5xl'

const buttonRowClassName = 'mt-5 flex flex-wrap gap-3'

const splitSectionClassName = 'mx-auto w-[min(1380px,calc(100%_-_30px))] py-4 md:py-6'

const splitGridClassName = 'grid grid-cols-1 items-center gap-4 lg:grid-cols-2'

const splitCopyClassName = 'min-w-0'

const splitTextClassName = 'mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]'

const splitMediaClassName =
  'min-h-60 overflow-hidden rounded-lg border border-[var(--line)] bg-white'

const placeholderClassName =
  'grid min-h-60 w-full place-items-center text-sm text-[var(--muted)]'

const gallerySectionClassName =
  'cms-gallery-section mx-auto grid w-[min(1380px,calc(100%_-_30px))] gap-7 pb-6 md:gap-12 lg:gap-16'

const galleryHeadingClassName =
  'mx-auto m-0 w-full max-w-5xl overflow-hidden text-center text-3xl leading-tight tracking-normal text-[#121827] font-[600] md:text-5xl lg:text-6xl'

const galleryGridClassName =
  'cms-gallery-grid grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-[1.12fr_0.78fr_0.78fr_1.12fr] lg:auto-rows-[clamp(170px,15.6vw,298px)]'

const galleryItemClassName =
  'cms-gallery-item m-0 aspect-square min-h-0 overflow-hidden rounded-[10px] bg-white md:aspect-auto md:rounded-[18px]'

const productSectionClassName =
  'cms-product-spotlight relative isolate w-full overflow-hidden py-16 md:py-20 lg:py-24'

const collageSectionClassName =
  'cms-collage-section mx-auto grid w-[min(1380px,calc(100%_-_30px))] grid-cols-1 items-center gap-8 py-12 md:py-20 lg:grid-cols-[minmax(420px,0.98fr)_minmax(360px,0.82fr)] lg:gap-20 lg:py-20 xl:gap-32'

const collageMediaClassName = 'js-collage-media relative min-h-[360px] md:min-h-[560px] lg:min-h-[clamp(520px,47vw,780px)]'

const collageImageClassName =
  'js-collage-image absolute m-0 overflow-hidden rounded-lg bg-white shadow-[0_28px_74px_rgba(16,24,40,0.1)] will-change-transform'

const collageCopyClassName = 'mx-auto max-w-[340px] text-center lg:mx-0 lg:max-w-2xl lg:text-left'

const collageTitleClassName =
  'm-0 font-[600] text-[22px] leading-tight tracking-normal text-[#121827] md:text-5xl lg:text-[clamp(3.1rem,5.1vw,5.2rem)] lg:leading-none'

const collageEyebrowClassName =
  'mt-5 mb-0 text-[18px] font-extrabold leading-snug text-[var(--color-brand-orange)] md:mt-6 md:text-[20px]'

const collageDescriptionClassName =
  'mt-5 mb-0 text-base leading-6 text-[#3f4656] md:mt-6 md:text-[18px] md:leading-7 lg:text-[20px]'

const resourcesSectionClassName =
  'cms-resources-learning-section mx-auto grid w-[min(1380px,calc(100%_-_30px))] grid-cols-1 items-start gap-5 py-10 text-center md:gap-8 md:py-16 lg:grid-cols-[minmax(280px,0.76fr)_minmax(420px,1fr)] lg:gap-20 lg:text-left xl:gap-32'

const resourcesHeadingWrapClassName = 'min-w-0'

const resourcesHeadingClassName =
  'js-resources-heading m-0 font-[600] text-[22px] leading-tight tracking-normal text-[#121827] md:text-5xl lg:text-[clamp(2.4rem,3.4vw,4.5rem)]'

const resourcesCopyClassName = 'mx-auto grid max-w-[340px] gap-4 md:max-w-3xl md:gap-7 lg:mx-0'

const resourcesIntroClassName = 'js-resources-copy-item m-0 text-[18px] font-extrabold leading-snug text-[var(--color-brand-orange)] md:text-xl lg:text-[#121827]'

const resourcesDescriptionClassName = 'js-resources-copy-item m-0 text-base leading-6 text-[#3f4656] md:text-lg md:leading-7'

const featuredSectionClassName =
  'cms-featured-projects-section mx-auto grid w-[min(1380px,calc(100%_-_30px))] gap-8 py-12 md:gap-12 md:py-16 lg:gap-16 lg:py-20'

const featuredHeadingClassName =
  'js-featured-heading m-0 text-center font-[600] text-4xl leading-tight tracking-normal text-[#121827] md:text-6xl lg:text-[clamp(2.7rem,4.6vw,5.5rem)]'

const cmsPageClassName = 'flex flex-col w-full gap-8 bg-white md:gap-12 lg:gap-20'

const leadingHeroPageClassName = 'pt-0 md:pt-4 overflow-hidden'

function HeroSplitTitle({title, dataSanity}: {title: string; dataSanity?: string}) {
  const cleanTitle = stegaClean(title)
  const segments = cleanTitle.split(/(\s+)/)
  return (
    <h1 className={heroTitleClassName} aria-label={cleanTitle} data-sanity={dataSanity}>
      {segments.map((seg, i) =>
        /^\s+$/.test(seg) ? (
          seg
        ) : (
          <span key={i} className={heroWordOuterClassName}>
            <span className="hero-word-inner inline-block will-change-transform">{seg}</span>
          </span>
        ),
      )}
    </h1>
  )
}

function CollageSplitTitle({title, dataSanity}: {title: string; dataSanity?: string}) {
  const cleanTitle = stegaClean(title)
  const segments = cleanTitle.split(/(\s+)/)
  return (
    <h2 className={collageTitleClassName} aria-label={cleanTitle} data-sanity={dataSanity}>
      {segments.map((seg, i) =>
        /^\s+$/.test(seg) ? (
          seg
        ) : (
          <span key={i} className="collage-word-outer inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
            <span className="collage-word-inner inline-block will-change-transform">{seg}</span>
          </span>
        ),
      )}
    </h2>
  )
}

function HeroBlockSection({block, pageId}: {block: Extract<CmsContentBlock, {_type: 'heroBlock'}>; pageId?: string}) {
  const backgroundImageUrl =
    block.backgroundMedia?.type === 'image'
      ? mediaImageUrl(block.backgroundMedia, 2400)
      : null
  const backgroundVideoUrl = block.backgroundMedia?.type === 'video' ? block.backgroundMedia.videoUrl : null
  const overlayOpacity = typeof block.overlayOpacity === 'number' ? block.overlayOpacity / 100 : 0.45
  const contentAlignment =
    block.contentAlignment === 'center' || block.contentAlignment === 'right'
      ? block.contentAlignment
      : 'left'
  const heroContentClassName = cx(heroContentBaseClassName, heroContentAlignmentClassNames[contentAlignment])
  const heroTitleColumnClassName = cx(
    heroTitleColumnBaseClassName,
    contentAlignment === 'right' && 'lg:col-start-2 text-center md:text-right',
  )
  const heroActionColumnClassName = cx(
    heroActionColumnBaseClassName,
    contentAlignment === 'center' && 'lg:mx-auto',
    contentAlignment === 'right' && 'lg:col-start-1 lg:row-start-1',
  )
  const heroCtaRowClassName = cx(
    heroCtaRowBaseClassName,
    contentAlignment === 'center' && 'lg:justify-center',
    contentAlignment === 'right' && 'lg:justify-end',
  )

  return (
    <section className={heroSectionClassName}>
      {backgroundVideoUrl ? (
        <div className={heroBackgroundClassName} aria-hidden>
          <video className={heroBackgroundMediaClassName} autoPlay muted loop playsInline>
            <source src={backgroundVideoUrl} />
          </video>
        </div>
      ) : backgroundImageUrl ? (
        <div className={heroBackgroundClassName} aria-hidden>
          <img className={heroBackgroundMediaClassName} src={backgroundImageUrl} alt="" />
        </div>
      ) : null}
      <div className={heroOverlayClassName} style={{opacity: overlayOpacity}} aria-hidden />

      <HeroGsapAnimations />

      <div className={heroContentClassName}>
        <div className={heroTitleColumnClassName}>
          <HeroSplitTitle
            title={block.title || 'Untitled section'}
            dataSanity={pageId && block._key ? createDataAttribute({id: pageId, type: 'page', path: `contentBlocks[_key=="${block._key}"].title`}).toString() : undefined}
          />
        </div>

        {block.description || (block.cta && block.cta.length > 0) ? (
          <div className={heroActionColumnClassName}>
            {block.description ? <p className={heroDescriptionClassName}>{block.description}</p> : null}
            {block.cta && block.cta.length > 0 ? (
              <div className={heroCtaRowClassName}>
                {block.cta.map((button, index) => (
                  <CmsButtonLink
                    key={button._key || `${button.text}-${index}`}
                    button={button}
                    className={heroButtonClassName}
                  />
                ))}
              </div>
            ) : null}
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
    <section className={splitSectionClassName}>
      <div className={splitGridClassName}>
        <div className={cx(splitCopyClassName, imageFirst && 'lg:order-2')}>
          <h2 className={sectionHeadingClassName}>{block.title || 'Untitled section'}</h2>
          {block.description ? <p className={splitTextClassName}>{block.description}</p> : null}
          {block.cta && block.cta.length > 0 ? (
            <div className={buttonRowClassName}>
              {block.cta.map((button, index) => (
                <CmsButtonLink key={button._key || `${button.text}-${index}`} button={button} />
              ))}
            </div>
          ) : null}
        </div>

        <div className={cx(splitMediaClassName, imageFirst && 'lg:order-1')}>
          {imageUrl ? (
            <img className="h-full w-full object-cover" src={imageUrl} alt={block.mainImage?.alt || block.title || 'Section image'} />
          ) : (
            <div className={placeholderClassName}>No image selected</div>
          )}
        </div>
      </div>
    </section>
  )
}

function GallerySplitTitle({title, className, dataSanity}: {title: string; className?: string; dataSanity?: string}) {
  const cleanTitle = stegaClean(title)
  const segments = cleanTitle.split(/(\s+)/)
  return (
    <h2 className={className} aria-label={cleanTitle} data-sanity={dataSanity}>
      {segments.map((seg, i) =>
        /^\s+$/.test(seg) ? (
          seg
        ) : (
          <span key={i} className="gallery-word-outer inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
            <span className="gallery-word-inner inline-block will-change-transform">{seg}</span>
          </span>
        ),
      )}
    </h2>
  )
}

function ImageGallerySection({block, pageId}: {block: Extract<CmsContentBlock, {_type: 'imageGalleryBlock'}>; pageId?: string}) {
  const images = (block.images || [])
    .map((image) => ({
      key: image.asset?._ref,
      url: sanityImageUrl(image, 1200),
      alt: image.alt || block.title || 'Gallery image',
    }))
    .filter((image): image is {key: string; url: string; alt: string} => Boolean(image.key && image.url))

  if (images.length === 0) {
    return null
  }

  return (
    <section className={gallerySectionClassName}>
      <GalleryAnimations />
      <GallerySplitTitle
        title={block.title || 'Transforming the Way Spaces Come Alive'}
        className={galleryHeadingClassName}
        dataSanity={pageId && block._key ? createDataAttribute({id: pageId, type: 'page', path: `contentBlocks[_key=="${block._key}"].title`}).toString() : undefined}
      />
      <div className={galleryGridClassName}>
        {images.map((image, index) => (
          <figure
            className={cx(
              galleryItemClassName,
              // Row 1–2: tall pillars
              index === 0 && 'lg:row-span-2',
              index === 3 && 'lg:col-start-4 lg:row-span-2',
              // Row 2: wide centre
              index === 4 && 'col-span-2  md:col-span-1 md:aspect-auto lg:col-span-2 lg:col-start-2',
              // Row 3: 3 images fill full 4-column width (1.12 | 1.56 | 1.12)
              index === 5 && 'lg:col-[1/2]',
              index === 6 && 'lg:col-[2/4]',
              index === 7 && 'lg:col-[4/5]',
            )}
            key={`${image.key}-${index}`}
          >
            <img className="h-full w-full object-cover" src={image.url} alt={image.alt} />
          </figure>
        ))}
      </div>
    </section>
  )
}

function ProductSpotlightSection({
  block,
}: {
  block: Extract<CmsContentBlock, {_type: 'productSpotlightBlock'}>
}) {
  const items: SpotlightItem[] = (block.items || [])
    .map((item, index) => {
      const product = item.product
      const imageUrl =
        sanityImageUrl(item.imageOverride, 1100) ||
        sanityImageUrl(product?.listingCardImage, 1100) ||
        sanityImageUrl(product?.heroImage, 1100) ||
        mediaImageUrl(product?.heroMedia, 1100)

      if (!product?.slug || !product.name) {
        return null
      }

      return {
        key: item._key || product._id || product.slug,
        index,
        imageUrl,
        imageAlt: item.imageOverride?.alt || product.name,
        hotspotX: typeof item.hotspotX === 'number' ? item.hotspotX : 50,
        hotspotY: typeof item.hotspotY === 'number' ? item.hotspotY : 50,
        name: product.name,
        slug: product.slug,
        badgeText: product.listingBadgeText || product.category || null,
        description:
          product.shortDescription || product.heroDescription || 'Explore this product in detail.',
      } satisfies SpotlightItem
    })
    .filter((item): item is SpotlightItem => Boolean(item))

  if (items.length === 0) {
    return null
  }

  return (
    <section className={productSectionClassName}>
      <ProductSpotlightClient items={items} title={block.title || 'Our Products'} />
    </section>
  )
}

function ImageCollageCtaSection({
  block,
  pageId,
}: {
  block: Extract<CmsContentBlock, {_type: 'imageCollageCtaBlock'}>
  pageId?: string
}) {
  const mainImageUrl = sanityImageUrl(block.mainImage, 1200)
  const topImageUrl = sanityImageUrl(block.topImage, 760)
  const bottomImageUrl = sanityImageUrl(block.bottomImage, 760)

  if (!mainImageUrl || !topImageUrl || !bottomImageUrl) {
    return null
  }

  return (
    <section className={collageSectionClassName}>
      <div className={collageMediaClassName} aria-label={block.title || 'Image collage'}>
        <figure className={cx(collageImageClassName, 'left-0 top-[18%] z-[1] h-[58%] w-[48%] lg:left-[6%] lg:top-[24%] lg:h-[52%] lg:w-[72%]')}>
          <img className="h-full w-full object-cover" src={mainImageUrl} alt={block.mainImage?.alt || block.title || 'Main section image'} />
        </figure>
        <figure className={cx(collageImageClassName, 'right-0 top-0 z-[2] h-[47%] w-[47%] lg:h-[45%] lg:w-[43%]')}>
          <img className="h-full w-full object-cover" src={topImageUrl} alt={block.topImage?.alt || block.title || 'Top section image'} />
        </figure>
        <figure className={cx(collageImageClassName, 'bottom-[4%] right-0 z-[3] h-[47%] w-[47%] lg:bottom-0 lg:left-0 lg:right-auto lg:h-[43%] lg:w-[39%]')}>
          <img className="h-full w-full object-cover" src={bottomImageUrl} alt={block.bottomImage?.alt || block.title || 'Bottom section image'} />
        </figure>
      </div>

      <div className={collageCopyClassName}>
        <CollageSplitTitle
          title={block.title || 'What We Do'}
          dataSanity={pageId && block._key ? createDataAttribute({id: pageId, type: 'page', path: `contentBlocks[_key=="${block._key}"].title`}).toString() : undefined}
        />
        {block.eyebrow ? <p className={cx(collageEyebrowClassName, 'js-collage-copy-item')}>{block.eyebrow}</p> : null}
        {block.description ? <p className={cx(collageDescriptionClassName, 'js-collage-copy-item')}>{block.description}</p> : null}
        <div className="js-collage-copy-item">
          <CmsButtonsRow buttons={block.cta} className="mt-7 justify-center md:mt-9 lg:justify-start" buttonClassName="!min-h-14 !w-full !min-w-full !rounded-[8px] !text-[15px] !px-7 !font-extrabold sm:!w-auto sm:!min-w-44 lg:!rounded-[6px]" />
        </div>
      </div>
    </section>
  )
}

function productAttributeValueToLabel(
  attribute: NonNullable<
    NonNullable<Extract<CmsContentBlock, {_type: 'pinnedProductShowcaseBlock'}>['product']>['productAttributes']
  >[number],
) {
  if (attribute.singleOptionValue?.label) {
    return attribute.singleOptionValue.label
  }

  if (attribute.multiOptionValues && attribute.multiOptionValues.length > 0) {
    return attribute.multiOptionValues
      .map((item) => item.label || item.value)
      .filter(Boolean)
      .join(', ')
  }

  if (attribute.textValue) {
    return attribute.textValue
  }

  if (typeof attribute.numberValue === 'number') {
    const unit = attribute.definition?.unit ? ` ${attribute.definition.unit}` : ''
    return `${attribute.numberTextValue || String(attribute.numberValue)}${unit}`
  }

  if (typeof attribute.booleanValue === 'boolean') {
    return attribute.booleanValue ? 'Yes' : 'No'
  }

  return null
}

function PinnedProductShowcaseSection({
  block,
}: {
  block: Extract<CmsContentBlock, {_type: 'pinnedProductShowcaseBlock'}>
}) {
  const product = block.product
  const backgroundImageUrl = sanityImageUrl(block.backgroundImage, 2400)
  const productImageUrl =
    sanityImageUrl(block.productImageOverride, 1200) ||
    sanityImageUrl(product?.listingCardImage, 1200) ||
    sanityImageUrl(product?.heroImage, 1200) ||
    mediaImageUrl(product?.heroMedia, 1200)

  if (!backgroundImageUrl || !product?.slug || !product.name) {
    return null
  }

  const title = block.title || product.name
  const detailTitle = block.detailTitle || product.name
  const description =
    block.description ||
    product.shortDescription ||
    product.heroDescription ||
    'Explore this product in detail.'
  const cta = block.cta?.[0]
  const resolvedCta = cta?.text ? resolveButtonHref(cta) : null
  const downloads =
    block.downloadLinks && block.downloadLinks.length > 0
      ? block.downloadLinks
          .filter((download) => Boolean(download.label && download.url))
          .map((download, index) => ({
            key: download._key || `${download.label}-${index}`,
            label: download.label as string,
            url: download.url as string,
          }))
      : (product.resources || [])
          .filter((resource) => Boolean(resource.title && resource.url))
          .map((resource, index) => ({
            key: resource._id || `${resource.title}-${index}`,
            label: resource.title as string,
            url: resource.url as string,
          }))
  const specs =
    block.specItems && block.specItems.length > 0
      ? block.specItems
          .filter((spec) => Boolean(spec.label))
          .map((spec, index) => ({
            key: spec._key || `${spec.label}-${index}`,
            label: spec.label as string,
            color: spec.color,
          }))
      : [
          ...(product.productAttributes || [])
            .map((attribute, index) => {
              const value = productAttributeValueToLabel(attribute)
              const title = attribute.definition?.title

              if (!value) {
                return null
              }

              return {
                key: `${title || 'attribute'}-${index}`,
                label: title ? `${title}: ${value}` : value,
                color: index % 2 === 0 ? '#f2b44c' : '#f0cf3a',
              }
            })
            .filter((spec): spec is {key: string; label: string; color: string} => Boolean(spec))
            .slice(0, 4),
        ]

  const resolvedSpecs =
    specs.length > 0
      ? specs
      : [
          {key: 'product-name', label: product.name, color: '#f2b44c'},
          {key: 'product-type', label: 'Product resources available', color: '#f0cf3a'},
        ]

  return (
    <PinnedProductShowcase
      title={title}
      detailTitle={detailTitle}
      description={description}
      backgroundImageUrl={backgroundImageUrl}
      backgroundAlt={block.backgroundImage?.alt || title}
      productImageUrl={productImageUrl}
      productImageAlt={block.productImageOverride?.alt || product.name}
      productHref={`/products/${product.slug}`}
      configureHref={`/configurator/product/${product.slug}`}
      cta={
        resolvedCta?.href
          ? {
              text: cta?.text || 'Configure',
              href: resolvedCta.href,
              isExternal: resolvedCta.isExternal,
              openInNewTab: resolvedCta.openInNewTab,
            }
          : undefined
      }
      specs={resolvedSpecs}
      downloads={downloads}
      productSlug={product.slug}
    />
  )
}

function ResourcesLearningSection({
  block,
}: {
  block: Extract<CmsContentBlock, {_type: 'resourcesLearningBlock'}>
}) {
  return (
    <section className={resourcesSectionClassName}>
      <div className={resourcesHeadingWrapClassName}>
        <h2 className={resourcesHeadingClassName}>{block.title || 'Resources & Learning'}</h2>
        <div className="js-resources-cta">
          <CmsButtonsRow buttons={block.cta} className="mt-10 justify-center md:mt-6 lg:justify-start" buttonClassName="md:!min-h-14 !min-h-10 !w-full !min-w-full md:!rounded-lg !px-6 !font-extrabold sm:!w-auto sm:!min-w-44" />
        </div>
      </div>

      <div className={resourcesCopyClassName}>
        {block.intro ? <p className={resourcesIntroClassName}>{block.intro}</p> : null}
        {block.description ? (
          <p className={resourcesDescriptionClassName}>{block.description}</p>
        ) : null}
      </div>
    </section>
  )
}

function FeaturedProjectsSection({
  block,
}: {
  block: Extract<CmsContentBlock, {_type: 'featuredProjectsBlock'}>
}) {
  const projects: FeaturedProjectSlide[] = (block.projects || [])
    .filter((project) => Boolean(project?.title))
    .map((project, index) => {
      const imageUrl = sanityImageUrl(project.coverImage, 1000)
      const meta = [project.location, project.projectType, project.completionYear]
        .filter(Boolean)
        .join(' • ')

      return {
        key: project._id || `${project.title}-${index}`,
        title: project.title as string,
        description: project.description,
        meta,
        imageUrl,
        imageAlt: project.coverImage?.alt || project.title || 'Project image',
        href: project.slug ? `/projects/${project.slug}` : undefined,
      }
    })

  if (projects.length === 0) {
    return null
  }

  const cta = block.cta?.[0]
  const resolvedCta = resolveButtonHref(cta)
  const arrowHref = resolvedCta.href || '/projects'

  return (
    <section className={featuredSectionClassName}>
      <h2 className={featuredHeadingClassName}>{block.title || 'Featured Projects'}</h2>
      <div className="js-featured-slider">
        <FeaturedProjectsSlider projects={projects} arrowHref={arrowHref} />
      </div>
      <div className="js-featured-cta">
        <CmsButtonsRow buttons={block.cta} className="justify-center" buttonClassName="!min-h-14 !min-w-48 !rounded-lg !px-7 !font-extrabold" />
      </div>
    </section>
  )
}

function RenderBlock({block, pageId}: {block: CmsContentBlock; pageId?: string}) {
  if (block._type === 'heroBlock') {
    return <HeroBlockSection block={block} pageId={pageId} />
  }

  if (block._type === 'contentImageCta') {
    return <ContentImageCtaSection block={block} />
  }

  if (block._type === 'imageGalleryBlock') {
    return <ImageGallerySection block={block} pageId={pageId} />
  }

  if (block._type === 'productSpotlightBlock') {
    return <ProductSpotlightSection block={block} />
  }

  if (block._type === 'imageCollageCtaBlock') {
    return <ImageCollageCtaSection block={block} pageId={pageId} />
  }

  if (block._type === 'pinnedProductShowcaseBlock') {
    return <PinnedProductShowcaseSection block={block} />
  }

  if (block._type === 'resourcesLearningBlock') {
    return <ResourcesLearningSection block={block} />
  }

  if (block._type === 'featuredProjectsBlock') {
    return <FeaturedProjectsSection block={block} />
  }

  return null
}

export function CmsPageView({page}: {page: CmsPage}) {
  const blocks = page.contentBlocks ?? []
  const hasLeadingHero = blocks[0]?._type === 'heroBlock'
  const hasImageCollage = blocks.some((block) => block._type === 'imageCollageCtaBlock')
  const hasResourcesOrProjects = blocks.some(
    (block) => block._type === 'resourcesLearningBlock' || block._type === 'featuredProjectsBlock',
  )

  if (blocks.length === 0) {
    return (
      <main className="mx-auto my-6 w-[min(1380px,calc(100%_-_30px))] flex-1">
        <section className="rounded-[18px] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-9">
          <h1 className="m-0 mb-3 font-[600] text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
            {page.title || 'Untitled page'}
          </h1>
          <p className="m-0 text-[var(--muted)]">No content blocks have been added to this page yet.</p>
        </section>
      </main>
    )
  }

  return (
    <main className={cx(cmsPageClassName, hasLeadingHero && leadingHeroPageClassName)}>
      {hasImageCollage ? <ImageCollageAnimations /> : null}
      {hasResourcesOrProjects ? <ResourcesProjectsAnimations /> : null}
      {blocks.map((block, index) => (
        <RenderBlock key={block._key || `${block._type}-${index}`} block={block} pageId={page._id} />
      ))}
    </main>
  )
}

export function CmsButtonsRow({
  buttons,
  className,
  buttonClassName,
}: {
  buttons: CmsButton[] | undefined
  className?: string
  buttonClassName?: string
}) {
  if (!buttons || buttons.length === 0) {
    return null
  }

  return (
    <div className={cx(buttonRowClassName, className)}>
      {buttons.map((button, index) => (
        <CmsButtonLink key={button._key || `${button.text}-${index}`} button={button} className={buttonClassName} />
      ))}
    </div>
  )
}
