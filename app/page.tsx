import Link from 'next/link'
import {CmsPageView} from '@/components/CmsPageView'
import {getPageBySlug} from '@/lib/cms'

type SearchParams = Record<string, string | string[] | undefined>

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const [page, params] = await Promise.all([getPageBySlug('home'), searchParams])

  if (!page) {
    return (
      <main className="cms-section-width my-6 flex-1">
        <section className="rounded-[18px] border border-[var(--line)] bg-gradient-to-br from-white to-[#f7f8fb] p-6 shadow-[var(--shadow-soft)] md:p-9">
          <h1 className="m-0 mb-3 font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
            Home page is not published yet
          </h1>
          <p className="m-0 max-w-3xl text-sm text-[var(--muted)] md:text-base">
            Create a `page` document with slug `home` in Sanity Studio to control this page with
            dynamic content blocks.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/products">
              Open Product Listing
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return <CmsPageView page={page} searchParams={params} basePath="/" />
}
