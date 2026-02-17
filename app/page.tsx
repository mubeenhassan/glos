import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <h1>Architectural Lighting Catalog</h1>
        <p>
          Browse products, open rich product pages, and configure SKU-level variants with dynamic
          filters driven directly from your Sanity CMS structure.
        </p>

        <div className="cta-row">
          <Link className="btn btn-primary" href="/products">
            Open Product Listing
          </Link>
          <Link className="btn" href="/products/inter-angled-linear-light">
            Open Product Page
          </Link>
          <Link className="btn" href="/configurator/product/inter-angled-linear-light">
            Open Configurator
          </Link>
        </div>
      </section>
    </main>
  )
}
