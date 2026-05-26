import {notFound} from 'next/navigation'
import {CmsPageView} from '@/components/CmsPageView'
import {getPageBySlug} from '@/lib/cms'

type DynamicPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DynamicPage({params, searchParams}: DynamicPageProps) {
  const [{slug}, resolvedSearchParams] = await Promise.all([params, searchParams])

  const page = await getPageBySlug(slug)
  if (!page) {
    notFound()
  }

  return <CmsPageView page={page} searchParams={resolvedSearchParams} basePath={`/${slug}`} />
}
