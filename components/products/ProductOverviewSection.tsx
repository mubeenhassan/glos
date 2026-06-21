import {type ProductOverview} from '@/lib/catalog'
import {sanityImageUrl} from '@/lib/sanity'
import ProductOverviewSlider from './ProductOverviewSlider'
import ProductOverviewHighlights from './ProductOverviewHighlights'
import ProductOverviewSplitFeature from './ProductOverviewSplitFeature'

function imageAspectRatio(image: {asset?: {_ref?: string}} | undefined) {
  const dimensions = image?.asset?._ref?.split('-')[2]
  const match = dimensions?.match(/^(\d+)x(\d+)$/)
  if (!match) return 4 / 5
  const width = Number(match[1])
  const height = Number(match[2])
  return width > 0 && height > 0 ? width / height : 4 / 5
}

export default function ProductOverviewSection({overview}: {overview?: ProductOverview}) {
  if (!overview) return null

  const hasIntroduction = Boolean(overview.heading || overview.description)
  const hasSlides = Boolean(overview.slides?.length)
  const hasHighlights = Boolean(overview.highlights?.length)
  const hasSplitFeature = Boolean(
    overview.splitFeature?.heading && overview.splitFeature.images?.length,
  )

  if (!hasIntroduction && !hasSlides && !hasHighlights && !hasSplitFeature) return null

  const slides = (overview.slides || []).map((slide) => ({
    key: slide.key,
    imageUrl: sanityImageUrl(slide.image, 1800),
    alt: slide.alt,
    aspectRatio: imageAspectRatio(slide.image),
    hotspots: slide.hotspots
      .filter((hotspot) => hotspot.product)
      .map((hotspot) => ({
        key: hotspot.key,
        x: hotspot.x,
        y: hotspot.y,
        product: {
          name: hotspot.product!.name,
          slug: hotspot.product!.slug,
          description: hotspot.product!.shortDescription,
          badge: hotspot.product!.listingBadgeText,
        },
      })),
  }))
  const highlights = (overview.highlights || []).map((item) => ({
    key: item.key,
    title: item.title,
    description: item.description,
    iconUrl: sanityImageUrl(item.icon, 220),
  }))
  const splitFeature = overview.splitFeature
  const featureImages = (splitFeature?.images || []).map((item) => ({
    key: item.key,
    url: sanityImageUrl(item.image, 1000),
    alt: item.alt,
  }))

  return (
    <section
      className="mt-20 md:mt-28"
      aria-labelledby={overview.heading ? 'product-overview-heading' : undefined}
      aria-label={overview.heading ? undefined : 'Product overview'}
    >
      {hasIntroduction ? (
        <div className="mx-auto mt-8 max-w-[920px] text-center md:mt-16">
          {overview.heading ? (
            <h2 id="product-overview-heading" className="m-0 text-[30px] font-[600] leading-tight tracking-[-0.02em] text-[#111827] md:text-[44px]">
              {overview.heading}
            </h2>
          ) : null}
          {overview.description ? (
            <p className={`m-0 text-[17px] leading-7 text-[#777d87] md:text-[21px] md:leading-9 ${overview.heading ? 'mt-5' : ''}`}>
              {overview.description}
            </p>
          ) : null}
        </div>
      ) : null}
      {hasSlides ? <ProductOverviewSlider slides={slides} /> : null}
      {hasHighlights ? <ProductOverviewHighlights items={highlights} /> : null}
      {hasSplitFeature && splitFeature ? (
        <ProductOverviewSplitFeature
          heading={splitFeature.heading}
          description={splitFeature.description}
          images={featureImages}
        />
      ) : null}
    </section>
  )
}
