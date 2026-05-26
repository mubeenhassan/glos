import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import ProjectDetailPageView from '@/components/projects/ProjectDetailPageView'
import {getProjectBySlug, getProjectsPageConfig} from '@/lib/projects'

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const {slug} = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return {title: 'Project not found'}
  }

  return {
    title: project.seo?.metaTitle || project.title,
    description:
      project.seo?.metaDescription ||
      project.shortDescription ||
      project.description ||
      undefined,
    robots: project.seo?.noIndex ? {index: false, follow: false} : undefined,
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  const [project, config] = await Promise.all([
    getProjectBySlug(slug),
    getProjectsPageConfig(),
  ])

  if (!project) {
    notFound()
  }

  return <ProjectDetailPageView project={project} config={config} />
}
