import Link from 'next/link'
import ProjectDetailAnimations from '@/components/projects/ProjectDetailAnimations'
import {mediaImageUrl, sanityImageUrl} from '@/lib/sanity'
import {
  categoryLabelFor,
  type ProjectDetail,
  type ProjectsPageConfig,
} from '@/lib/projects'

type ProductUsageWithProduct = ProjectDetail['productsUsed'][number] & {
  product: NonNullable<ProjectDetail['productsUsed'][number]['product']>
}

function formatArea(area: {value: number | null; unit: string | null} | null) {
  if (!area || typeof area.value !== 'number') return null
  const formatted = new Intl.NumberFormat('en').format(area.value)
  const unit = area.unit?.trim() || ''
  return unit ? `${formatted} ${unit}` : formatted
}

function ProjectTitleWords({title}: {title: string}) {
  const segments = title.split(/(\s+)/)

  return (
    <h1
      className="m-0 max-w-full break-words font-[600] text-[24px] leading-[1.06] tracking-normal text-[#111827] [overflow-wrap:anywhere] md:text-4xl md:leading-[1.04] lg:text-[72px]"
      aria-label={title}
    >
      {segments.map((segment, index) =>
        /^\s+$/.test(segment) ? (
          segment
        ) : (
          <span
            key={index}
            className="inline-block max-w-full overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom [overflow-wrap:anywhere]"
          >
            <span className="js-project-title-word inline-block max-w-full [overflow-wrap:anywhere] will-change-transform">
              {segment}
            </span>
          </span>
        ),
      )}
    </h1>
  )
}

function ProjectBreadcrumb({
  title,
  labels,
}: {
  title: string
  labels: ProjectsPageConfig['detail']
}) {
  return (
    <nav
      className="js-project-breadcrumb text-[14px] font-medium leading-5 text-[#374151] md:justify-self-end md:pt-4 md:text-[20px] md:leading-[1.4]"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2 md:gap-[12px]">
        <li>
          <Link
            className="transition-colors duration-150 hover:text-[#111827]"
            href="/"
          >
            {labels.breadcrumbHomeLabel}
          </Link>
        </li>
        <li aria-hidden className="text-[#0000001A] text-[13px] md:text-[14px]">
          /
        </li>
        <li>
          <Link
            className="transition-colors duration-150 hover:text-[#111827]"
            href="/projects"
          >
            {labels.breadcrumbProjectsLabel}
          </Link>
        </li>
        <li aria-hidden className="text-[#0000001A] text-[13px] md:text-[14px]">
          /
        </li>
        <li
          aria-current="page"
          className="max-w-[10rem] truncate font-semibold text-[var(--color-brand-orange)] md:max-w-[12rem]"
        >
          {title}
        </li>
      </ol>
    </nav>
  )
}

function ProductsUsedCard({
  entry,
  labels,
}: {
  entry: ProductUsageWithProduct
  labels: ProjectsPageConfig['detail']
}) {
  const product = entry.product
  const imageUrl =
    sanityImageUrl(product.listingCardImage, 900) ||
    sanityImageUrl(product.heroImage, 900) ||
    mediaImageUrl(product.heroMedia, 900)
  const unitText =
    typeof entry.units === 'number' && Number.isFinite(entry.units)
      ? `${entry.units} ${labels.unitsLabel}`
      : entry.note || null

  return (
    <Link
      href={`/products/${product.slug}`}
      className="js-product-card group relative block aspect-[4/5] min-h-[250px] md:min-h-[300px] overflow-hidden rounded-[8px] bg-[#1a1d24] transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/50 focus-visible:ring-offset-2 sm:min-h-[340px] md:min-h-[430px] lg:min-h-[490px]"
      aria-label={`View ${product.name}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="js-product-image absolute inset-0 h-[112%] w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#2a2e36_0%,#13151a_100%)]" />
      )}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_22%,rgba(0,0,0,0.58)_100%)]"
        aria-hidden
      />
      <div className="js-product-caption absolute inset-x-3 bottom-3 rounded-[8px] border border-white/25 bg-[#FFFFFF26] px-3 py-4 text-center text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-md md:inset-x-5 md:bottom-5 md:px-4 md:py-7">
        <h3 className="m-0 font-[600] text-[18px] leading-tight md:text-[24px]">
          {product.name}
        </h3>
        {unitText ? (
          <p className="m-0 mt-3 text-[15px] font-bold leading-tight text-white/95 md:mt-4 md:text-[20px]">
            {unitText}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export default function ProjectDetailPageView({
  project,
  config,
}: {
  project: ProjectDetail
  config: ProjectsPageConfig
}) {
  const labels = config.detail
  const heroImageUrl = sanityImageUrl(project.heroImage, 2200)
  const heroAlt = project.heroImage?.alt || project.title
  const description = project.description || project.shortDescription
  const categoryLabel = categoryLabelFor(project.category, config.categories)
  const areaLabel = formatArea(project.area)

  const gallery = (project.gallery || [])
    .map((image, index) => ({
      key: image.asset?._ref || `gallery-${index}`,
      url: sanityImageUrl(image, 1200),
      alt: image.alt || `${project.title} - image ${index + 1}`,
    }))
    .filter((item): item is {key: string; url: string; alt: string} =>
      Boolean(item.url),
    )

  const galleryThumbs = gallery.slice(0, 3)
  const productsUsed = (project.productsUsed || []).filter(
    (item): item is ProductUsageWithProduct => Boolean(item.product?.slug),
  )

  const detailItems = [
    {label: labels.locationLabel, value: project.location},
    {
      label: labels.yearLabel,
      value: project.completionYear ? String(project.completionYear) : null,
    },
    {label: labels.areaLabel, value: areaLabel},
    {label: labels.categoryLabel, value: categoryLabel},
    {label: labels.clientLabel, value: project.client},
  ].filter((item): item is {label: string; value: string} => Boolean(item.value))

  return (
    <main className="page-wrap project-detail-page mx-auto flex !w-[calc(100%_-_24px)] flex-col gap-7 pb-16 md:!w-[calc(100%_-_30px)] md:gap-16 md:pb-24 lg:!w-[min(1680px,calc(100%_-_80px))]">
      <ProjectDetailAnimations />

      <header className="flex flex-col-reverse md:grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
        <ProjectTitleWords title={project.title} />
        <ProjectBreadcrumb title={project.title} labels={labels} />
      </header>

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-12">
        <div className="min-w-0">
          {categoryLabel ? (
            <span className="js-project-intro-item inline-flex rounded-[8px] bg-[#FB612E1A] px-[16px] py-[6px] text-[11px] font-semibold leading-[1] text-[var(--color-brand-orange)]">
              {categoryLabel}
            </span>
          ) : null}
          <h2 className="js-project-intro-item m-0 mt-4 break-words font-[600] text-[28px] leading-[1.12] tracking-normal text-[#111827] md:mt-5 md:text-[48px] md:leading-tight hidden md:block">
            {project.title}
          </h2>
          {description ? (
            <p className="js-project-intro-item m-0 mt-2 md:mt-4 max-w-3xl text-[16px] leading-7 text-[#374151] md:mt-5 md:text-[20px]">
              {description}
            </p>
          ) : null}
        </div>

        {detailItems.length > 0 ? (
          <aside
            className="js-project-details-card w-full self-start rounded-[12px] bg-[#FAFAFA] p-5 md:p-6"
            aria-label={labels.detailsTitle}
          >
            <h2 className="m-0 mb-4 font-[600] text-[20px] leading-tight text-[#111827] md:mb-5 md:text-[24px]">
              {labels.detailsTitle}
            </h2>
            <dl className="grid gap-4 md:gap-3">
              {detailItems.map((item) => (
                <div
                  key={item.label}
                  className="js-project-detail-row grid grid-cols-1 gap-1 pt-3 grid-cols-[minmax(104px,auto)_1fr] items-baseline md:gap-4 "
                >
                  <dt className="m-0 text-[16px] font-medium text-[#374151] md:text-[20px]">
                    {item.label}
                  </dt>
                  <dd className="m-0 min-w-0 break-words text-left text-[16px] font-bold text-[#111827] text-right md:text-[20px]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        ) : null}
      </section>

      <section className="grid w-full gap-6" aria-label="Project images">
        <figure className="js-project-hero-media m-0 aspect-[4/3] min-h-[250px] w-full overflow-hidden rounded-[8px] bg-[#eceef2] md:aspect-[16/7] md:min-h-[420px] lg:min-h-[520px]">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt={heroAlt}
              className="js-project-hero-image block h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#f7f8fb_0%,#e5e9f1_100%)] p-7 text-center text-[#5b6371]">
              <span className="font-[600] text-base md:text-lg">{project.title}</span>
            </div>
          )}
        </figure>

        {galleryThumbs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {galleryThumbs.map((image) => (
              <figure
                key={image.key}
                className="js-project-thumb m-0 aspect-[4/3] min-h-[195px] w-full overflow-hidden rounded-[8px] bg-[#eceef2] md:aspect-[8/5] md:min-h-[210px]"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  className="block h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>
        ) : null}
      </section>

      {productsUsed.length > 0 ? (
        <section
          aria-label={labels.productsTitle}
          className="grid gap-5 pt-2 md:gap-9 md:pt-8"
        >
          <h2 className="js-products-heading m-0 font-[600] text-[30px] leading-tight text-[#111827] md:text-[48px]">
            {labels.productsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {productsUsed.map((entry) => (
              <ProductsUsedCard
                key={entry._key}
                entry={entry}
                labels={labels}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
