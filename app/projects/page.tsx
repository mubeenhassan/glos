import type {Metadata} from 'next'
import {CmsPageView} from '@/components/CmsPageView'
import {getPageBySlug, type CmsContentBlock, type CmsPage} from '@/lib/cms'
import {getProjectsPageConfig, type ProjectsPageConfig} from '@/lib/projects'

type SearchParams = Record<string, string | string[] | undefined>

function buildFallbackProjectsPage(config: ProjectsPageConfig): CmsPage {
  const contentBlocks: CmsContentBlock[] = [
    {
      _type: 'projectsListingBlock',
      _key: 'projects-listing',
      title: config.title,
      description: config.description || undefined,
      showAllFilter: config.showAllFilter,
      allFilterLabel: config.allFilterLabel,
      categories: config.categories.map((category, index) => ({
        _key: `project-category-${index}`,
        value: category.value,
        label: category.label,
      })),
    },
  ]

  if (config.stats.length > 0) {
    contentBlocks.push({
      _type: 'statsBlock',
      _key: 'projects-stats',
      stats: config.stats,
    })
  }

  if (config.banner) {
    contentBlocks.push({
      _type: 'ctaBannerBlock',
      _key: 'projects-banner',
      heading: config.banner.heading || undefined,
      description: config.banner.description || undefined,
      cta: config.banner.cta,
      tone: 'subtle',
    })
  }

  return {
    _id: 'projects-page-fallback',
    title: config.title,
    slug: 'projects',
    contentBlocks,
    seo: config.seo || undefined,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, config] = await Promise.all([
    getPageBySlug('projects'),
    getProjectsPageConfig(),
  ])
  const seo = page?.seo || config.seo

  return {
    title: seo?.metaTitle || page?.title || config.title,
    description: seo?.metaDescription || config.description || undefined,
    robots: seo?.noIndex ? {index: false, follow: false} : undefined,
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const [page, params] = await Promise.all([getPageBySlug('projects'), searchParams])
  const resolvedPage = page || buildFallbackProjectsPage(await getProjectsPageConfig())

  return <CmsPageView page={resolvedPage} searchParams={params} basePath="/projects" />
}
