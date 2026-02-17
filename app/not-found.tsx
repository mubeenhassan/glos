import {CmsButtonsRow} from '@/components/CmsPageView'
import {getSiteSettings} from '@/lib/cms'

export default async function NotFoundPage() {
  const settings = await getSiteSettings()
  const fallbackDescription =
    "Oops! The page you're looking for seems to have wandered off into the digital void."
  const notFound = settings?.notFoundPage

  return (
    <main className="page-wrap">
      <section className="hero-panel not-found-panel">
        <p className="cms-eyebrow">{notFound?.errorCode || '404'}</p>
        <h1>{notFound?.heading || 'Page not found'}</h1>
        <p>{notFound?.description || fallbackDescription}</p>
        <CmsButtonsRow buttons={notFound?.cta} />
      </section>
    </main>
  )
}

