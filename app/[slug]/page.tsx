import {notFound} from 'next/navigation'
import {CmsPageView} from '@/components/CmsPageView'
import {getPageBySlug} from '@/lib/cms'

type DynamicPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function DynamicPage({params}: DynamicPageProps) {
  const {slug} = await params

  const page = await getPageBySlug(slug)
  if (!page) {
    notFound()
  }

  return <CmsPageView page={page} />
}

