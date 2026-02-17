import Link from 'next/link'
import {
  getProductBySlug,
  groupSpecsByDisplayGroup,
  pickAttribute,
} from '@/lib/catalog'
import {mediaImageUrl, sanityImageUrl} from '@/lib/sanity'

type SearchParams = Record<string, string | string[] | undefined>

function toSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{slug: string}>
  searchParams: Promise<SearchParams>
}) {
  const [{slug}, rawSearchParams] = await Promise.all([params, searchParams])
  const product = await getProductBySlug(slug)

  if (!product) {
    return (
      <main className="page-wrap">
        <section className="section">
          <h3>Product not found</h3>
          <Link href="/products" className="btn" style={{marginTop: 10}}>
            Back to products
          </Link>
        </section>
      </main>
    )
  }

  const heroMedia = product.heroMedia?.[0]
  const heroImageUrl = mediaImageUrl(heroMedia, 1200)
  const firstVariant = product.variants[0]

  const mergedSpecs = [
    ...(product.productAttributes || []),
    ...(firstVariant?.specAttributes || []).filter(
      (item) => !pickAttribute(product.productAttributes, item.definition?.key || ''),
    ),
  ]

  const groupedSpecs = groupSpecsByDisplayGroup(mergedSpecs)

  const resources = [
    ...(product.resources || []),
    ...(firstVariant?.downloads || []),
  ].filter((item, index, all) => all.findIndex((other) => other._id === item._id) === index)

  const hasModels = (product.availableModels || []).length > 0
  const hasSpecs = groupedSpecs.length > 0
  const hasResources = resources.length > 0
  const hasHighlights = (product.iconHighlights || []).length > 0
  const hasPerfectFor = (product.perfectFor || []).length > 0
  const hasRelated = (product.relatedProducts || []).length > 0

  const tabs = [
    {key: 'models', label: 'Available models', visible: hasModels},
    {key: 'specifications', label: 'Specifications', visible: hasSpecs},
    {key: 'resources', label: 'Resources', visible: hasResources},
    {key: 'highlights', label: 'Highlights', visible: hasHighlights},
    {key: 'perfectFor', label: 'Perfect for', visible: hasPerfectFor},
    {key: 'related', label: 'Related products', visible: hasRelated},
  ].filter((tab) => tab.visible)

  const requestedTab = toSingle(rawSearchParams.tab)
  const activeTab =
    tabs.find((tab) => tab.key === requestedTab)?.key || tabs[0]?.key || 'specifications'

  const tabHref = (key: string) => `/products/${product.slug}?tab=${key}`

  return (
    <main className="page-wrap pdp-page">
      <section className="pdp-hero">
        <div className="meta pdp-breadcrumb">
          <Link href="/products">Products</Link> / {product.name}
        </div>

        <div className="pdp-hero-grid">
          <div className="pdp-media-card">
            <div className="product-visual pdp-hero-visual">
              {heroImageUrl ? (
                <img src={heroImageUrl} alt={product.name} />
              ) : heroMedia?.videoUrl ? (
                <div style={{padding: 20, textAlign: 'center'}}>
                  <p className="meta">Video Preview</p>
                  <a className="btn" href={heroMedia.videoUrl} target="_blank" rel="noreferrer">
                    Open Video
                  </a>
                </div>
              ) : (
                <div className="product-placeholder" />
              )}
            </div>
          </div>

          <div className="pdp-info-card">
            {(product.listingBadgeText || product.variants.some((item) => item.isStocked)) && (
              <span className="badge">{product.listingBadgeText || 'STANDARD'}</span>
            )}
            <h1 className="pdp-title">{product.name}</h1>
            {product.shortDescription && <p className="meta">{product.shortDescription}</p>}
            {product.heroDescription && <p className="meta">{product.heroDescription}</p>}

            <div className="chip-wrap" style={{marginTop: 12}}>
              {product.brand && <span className="chip">Brand: {product.brand}</span>}
              {product.category && <span className="chip">Category: {product.category}</span>}
              {product.family && <span className="chip">Family: {product.family}</span>}
            </div>

            <div className="cta-row">
              <Link className="btn btn-primary" href={`/configurator/product/${product.slug}`}>
                Open configurator
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section pdp-section">
        {tabs.length === 0 ? (
          <p className="meta">No additional product details configured yet.</p>
        ) : (
          <>
            <div className="pdp-tab-row chip-wrap">
              {tabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={tabHref(tab.key)}
                  scroll={false}
                  className={`chip ${activeTab === tab.key ? 'chip-active' : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="pdp-tab-panel">
          {activeTab === 'models' && (
            <>
              <h3>Available models</h3>
              <div className="models-strip">
                {(product.availableModels || []).map((model) => {
                  const modelImageUrl = sanityImageUrl(model.listingCardImage, 300)
                  const isActive = model.slug === product.slug
                  return (
                    <Link
                      href={`/products/${model.slug}`}
                      key={model._id}
                      className={`model-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="product-visual" style={{aspectRatio: '16 / 10'}}>
                        {modelImageUrl ? <img src={modelImageUrl} alt={model.name} /> : <div className="product-placeholder" />}
                      </div>
                      <p className="product-name">{model.name}</p>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {activeTab === 'specifications' && (
            <>
              <h3>Specifications</h3>
              {groupedSpecs.length === 0 ? (
                <p className="meta">No specifications configured yet.</p>
              ) : (
                groupedSpecs.map((group) => (
                  <div key={group.group} className="group-block">
                    <h4 className="group-title">{group.group}</h4>
                    <div className="spec-grid">
                      {group.items.map((item) => (
                        <div key={`${group.group}-${item.label}`} className="spec-item">
                          <small>{item.label}</small>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'resources' && (
            <>
              <h3>Resources</h3>
              {resources.length === 0 ? (
                <p className="meta">No resources published yet.</p>
              ) : (
                <div className="resources-grid">
                  {resources.map((resource) => (
                    <a
                      key={resource._id}
                      className="resource-card"
                      href={resource.externalUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="resource-type">{resource.type.toUpperCase()}</div>
                      <p className="product-name">{resource.title}</p>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'highlights' && (
            <>
              <h3>Highlights</h3>
              <div className="highlight-grid">
                {(product.iconHighlights || []).map((highlight) => (
                  <article key={highlight._key} className="highlight-card">
                    <p className="product-name">{highlight.title}</p>
                    {highlight.description && <p className="meta">{highlight.description}</p>}
                  </article>
                ))}
              </div>
            </>
          )}

          {activeTab === 'perfectFor' && (
            <>
              <h3>Perfect for</h3>
              <div className="perfect-grid">
                {(product.perfectFor || []).map((item) => {
                  const imageUrl = sanityImageUrl(item.image, 450)

                  return (
                    <article key={item._id} className="perfect-card">
                      <div className="product-visual" style={{aspectRatio: '16 / 11'}}>
                        {imageUrl ? <img src={imageUrl} alt={item.title} /> : <div className="product-placeholder" />}
                      </div>
                      <p className="product-name">{item.title}</p>
                      {item.description && <p className="meta">{item.description}</p>}
                    </article>
                  )
                })}
              </div>
            </>
          )}

            {activeTab === 'related' && (
              <>
                <h3>Related products</h3>
                <div className="related-grid">
                  {(product.relatedProducts || []).map((related) => {
                    const imageUrl = sanityImageUrl(related.listingCardImage, 420)

                    return (
                      <Link key={related._id} href={`/products/${related.slug}`} className="related-card">
                        <div className="product-visual" style={{aspectRatio: '16 / 11'}}>
                          {imageUrl ? <img src={imageUrl} alt={related.name} /> : <div className="product-placeholder" />}
                        </div>
                        {related.listingBadgeText && <span className="badge">{related.listingBadgeText}</span>}
                        <p className="product-name">{related.name}</p>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
