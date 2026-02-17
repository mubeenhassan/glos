import Link from 'next/link'
import {CmsPageView} from '@/components/CmsPageView'
import {getPageBySlug} from '@/lib/cms'

export default async function HomePage() {
  const page = await getPageBySlug('home')

  if (!page) {
    return (
      <main className="page-wrap">
        <section className="hero-panel">
          <h1>Home page is not published yet</h1>
          <p>
            Create a `page` document with slug `home` in Sanity Studio to control this page with
            dynamic content blocks.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/products">
              Open Product Listing
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return <CmsPageView page={page} />
}

